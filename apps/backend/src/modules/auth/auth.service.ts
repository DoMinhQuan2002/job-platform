import { AppError } from "../../common/errors/app-error";
import { sendOtpMail } from "../../common/mail/mailer";
import { ROLES, type RoleValue } from "../../common/constants/roles";
import { ACCESS_TOKEN_TTL_SECONDS, signAccessToken } from "../../common/security/jwt";
import { hashPassword, verifyPassword } from "../../common/security/password";
import { generateOpaqueToken, sha256 } from "../../common/security/token";
import { getRedis } from "../../config/redis";
import { verifyGoogleIdToken } from "../../config/google";
import { AppDataSource } from "../../data-source";
import { RoleEntity } from "../../database/entities/role.entity";
import { SessionEntity } from "../../database/entities/session.entity";
import { UserEntity, UserStatus } from "../../database/entities/user.entity";
import { UserOauthAccountEntity } from "../../database/entities/user-oauth-account.entity";
import {
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  RESET_TOKEN_TTL_SECONDS,
  normalizeEmail,
  resetTokenKey,
} from "./auth.constants";
import {
  clearOtp,
  getResendCooldown,
  hasPendingOtp,
  issueOtp,
  verifyOtp,
} from "./auth.otp";
import type {
  EmailOnlyInput,
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyCodeInput,
} from "./auth.validation";

const GOOGLE_PROVIDER = "google";

const userRepo = () => AppDataSource.getRepository(UserEntity);
const roleRepo = () => AppDataSource.getRepository(RoleEntity);
const sessionRepo = () => AppDataSource.getRepository(SessionEntity);
const oauthRepo = () => AppDataSource.getRepository(UserOauthAccountEntity);

export type PublicUser = {
  id: number;
  email: string;
  fullName: string;
  role: string;
};

export type LoginResult = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  user: PublicUser;
};

const toPublicUser = (user: UserEntity): PublicUser => ({
  id: Number(user.id),
  email: user.email,
  fullName: user.fullName,
  role: user.role.name,
});

const findUserByEmail = (email: string) =>
  userRepo().findOne({
    where: { email },
    relations: { role: true },
    withDeleted: true,
  });

const resolveRole = async (name: RoleValue) => {
  const role = await roleRepo().findOne({ where: { name } });

  if (!role) {
    throw new AppError(
      500,
      "ROLE_NOT_SEEDED",
      `Role "${name}" chưa có trong bảng roles. Chạy migration seed roles trước.`,
    );
  }

  return role;
};

/** Sinh refresh token, luu ban hash vao sessions va tra ve token goc cho client. */
const createSession = async (user: UserEntity) => {
  const refreshToken = generateOpaqueToken();

  await sessionRepo().save(
    sessionRepo().create({
      user,
      refreshTokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      isRevoked: false,
    }),
  );

  return refreshToken;
};

/** Buoc cuoi cua moi luong dang nhap: cap access token + refresh token. */
const issueLogin = async (user: UserEntity): Promise<LoginResult> => {
  await userRepo().update({ id: user.id }, { lastLoginAt: new Date() });

  const refreshToken = await createSession(user);
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role.name as RoleValue,
  });

  return {
    accessToken,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    refreshToken,
    user: toPublicUser(user),
  };
};

const assertLoginable = (user: UserEntity) => {
  if (user.emailVerifiedAt === null) {
    throw new AppError(403, "EMAIL_NOT_VERIFIED", "Email chưa được xác thực");
  }

  if (user.status === UserStatus.BANNED) {
    throw new AppError(403, "ACCOUNT_BANNED", "Tài khoản đã bị khoá");
  }
};

export const authService = {
  /** 1.1 POST /register */
  register: async (input: RegisterInput) => {
    const email = normalizeEmail(input.email);
    const existing = await findUserByEmail(email);

    if (existing?.deletedAt) {
      throw new AppError(409, "EMAIL_ALREADY_EXISTS", "Email đã được sử dụng");
    }

    if (existing?.emailVerifiedAt) {
      throw new AppError(409, "EMAIL_ALREADY_EXISTS", "Email đã được đăng ký");
    }

    const role = await resolveRole(input.role);
    const passwordHash = await hashPassword(input.password);

    if (existing) {
      // Dang ky do dang chua verify -> ghi de thong tin thay vi insert row moi (tranh vi pham unique).
      existing.passwordHash = passwordHash;
      existing.fullName = input.fullName;
      existing.role = role;
      await userRepo().save(existing);
    } else {
      await userRepo().save(
        userRepo().create({
          email,
          passwordHash,
          fullName: input.fullName,
          role,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: null,
        }),
      );
    }

    const code = await issueOtp("register", email);
    await sendOtpMail(email, code, "register");

    return { email, otpExpiresIn: OTP_TTL_SECONDS };
  },

  /** 1.2 POST /register/verify-code */
  verifyRegisterCode: async (input: VerifyCodeInput) => {
    const email = normalizeEmail(input.email);
    const user = await findUserByEmail(email);

    if (!user || user.deletedAt || user.emailVerifiedAt) {
      throw new AppError(
        404,
        "PENDING_USER_NOT_FOUND",
        "Không tìm thấy tài khoản đang chờ xác thực với email này",
      );
    }

    const result = await verifyOtp("register", email, input.code);

    if (result !== "OK") {
      throw new AppError(400, "INVALID_OTP", "Mã xác thực không đúng hoặc đã hết hạn");
    }

    await userRepo().update({ id: user.id }, { emailVerifiedAt: new Date() });

    return { userId: Number(user.id), email };
  },

  /** 1.3 POST /register/resend-code */
  resendRegisterCode: async (input: EmailOnlyInput) => {
    const email = normalizeEmail(input.email);
    const user = await findUserByEmail(email);

    if (!user || user.deletedAt) {
      throw new AppError(
        404,
        "PENDING_USER_NOT_FOUND",
        "Không tìm thấy tài khoản đang chờ xác thực với email này",
      );
    }

    if (user.emailVerifiedAt) {
      throw new AppError(409, "EMAIL_ALREADY_VERIFIED", "Tài khoản đã được xác thực");
    }

    const cooldown = await getResendCooldown("register", email);

    if (cooldown > 0) {
      throw new AppError(
        400,
        "RESEND_TOO_SOON",
        `Vui lòng đợi ${cooldown} giây trước khi gửi lại mã`,
      );
    }

    const code = await issueOtp("register", email);
    await sendOtpMail(email, code, "register");

    return { otpExpiresIn: OTP_TTL_SECONDS };
  },

  /** 2.1 POST /login */
  login: async (input: LoginInput): Promise<LoginResult> => {
    const email = normalizeEmail(input.email);
    const user = await findUserByEmail(email);
    const invalidCredentials = new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Email hoặc mật khẩu không đúng",
    );

    if (!user || user.deletedAt) {
      throw invalidCredentials;
    }

    if (!(await verifyPassword(input.password, user.passwordHash))) {
      throw invalidCredentials;
    }

    assertLoginable(user);

    return issueLogin(user);
  },

  /** 2.2 POST /logout */
  logout: async (userId: string, refreshToken: string | undefined) => {
    if (!refreshToken) {
      throw new AppError(400, "REFRESH_TOKEN_MISSING", "Thiếu refresh token");
    }

    const session = await sessionRepo().findOne({
      where: { refreshTokenHash: sha256(refreshToken) },
      relations: { user: true },
    });

    if (!session || session.isRevoked || session.user.id !== userId) {
      throw new AppError(400, "SESSION_NOT_FOUND", "Phiên đăng nhập không tồn tại");
    }

    // Giu lai record de con dau vet, chi danh dau da thu hoi.
    await sessionRepo().update({ id: session.id }, { isRevoked: true });
  },

  /** 2.3 POST /refresh-token */
  refreshToken: async (refreshToken: string | undefined) => {
    const invalidToken = new AppError(
      401,
      "INVALID_REFRESH_TOKEN",
      "Refresh token không hợp lệ hoặc đã hết hạn",
    );

    if (!refreshToken) {
      throw invalidToken;
    }

    const session = await sessionRepo().findOne({
      where: { refreshTokenHash: sha256(refreshToken) },
      relations: { user: { role: true } },
    });

    if (!session || session.isRevoked || session.expiresAt.getTime() <= Date.now()) {
      throw invalidToken;
    }

    const user = session.user;

    if (user.deletedAt || user.status === UserStatus.BANNED || !user.emailVerifiedAt) {
      await sessionRepo().update({ id: session.id }, { isRevoked: true });
      throw invalidToken;
    }

    // Ban don gian: giu nguyen refresh token / cookie cu cho toi khi het han hoac logout.
    return {
      accessToken: signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role.name as RoleValue,
      }),
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  },

  /** 3.1 POST /forgot-password - luon tra ve success du email co ton tai hay khong. */
  forgotPassword: async (input: EmailOnlyInput) => {
    const email = normalizeEmail(input.email);
    const user = await findUserByEmail(email);

    if (!user || user.deletedAt) {
      return;
    }

    if ((await getResendCooldown("forgot_password", email)) > 0) {
      return;
    }

    const code = await issueOtp("forgot_password", email);

    try {
      await sendOtpMail(email, code, "forgot_password");
    } catch (error) {
      // Khong lo ra ngoai: response phai giong het truong hop email khong ton tai.
      console.error("Failed to send forgot-password OTP:", error);
    }
  },

  /** 3.2 POST /forgot-password/verify-code */
  verifyForgotPasswordCode: async (input: VerifyCodeInput) => {
    const email = normalizeEmail(input.email);
    // Gop chung 1 message cho moi truong hop sai, tranh lo email nao co tai khoan.
    const invalidCode = new AppError(
      400,
      "INVALID_OTP",
      "Mã xác thực không đúng hoặc đã hết hạn",
    );

    const user = await findUserByEmail(email);

    if (!user || user.deletedAt) {
      throw invalidCode;
    }

    if ((await verifyOtp("forgot_password", email, input.code)) !== "OK") {
      throw invalidCode;
    }

    const resetToken = generateOpaqueToken(32);
    await getRedis().set(resetTokenKey(resetToken), email, { ex: RESET_TOKEN_TTL_SECONDS });

    return { resetToken, resetTokenExpiresIn: RESET_TOKEN_TTL_SECONDS };
  },

  /** 3.3 POST /forgot-password/reset */
  resetPassword: async (input: ResetPasswordInput) => {
    const redis = getRedis();
    const key = resetTokenKey(input.resetToken);
    const email = await redis.get<string>(key);

    const invalidToken = new AppError(
      401,
      "INVALID_RESET_TOKEN",
      "Reset token không hợp lệ, đã dùng hoặc đã hết hạn",
    );

    if (!email) {
      throw invalidToken;
    }

    const user = await findUserByEmail(String(email));

    if (!user || user.deletedAt) {
      await redis.del(key);
      throw invalidToken;
    }

    await userRepo().update(
      { id: user.id },
      { passwordHash: await hashPassword(input.newPassword) },
    );

    await redis.del(key); // reset token dung 1 lan

    // Doi mat khau -> dang xuat toan bo thiet bi dang login.
    await sessionRepo()
      .createQueryBuilder()
      .update(SessionEntity)
      .set({ isRevoked: true })
      .where("user_id = :userId AND is_revoked = false", { userId: user.id })
      .execute();
  },

  /** 3.4 POST /forgot-password/resend-code */
  resendForgotPasswordCode: async (input: EmailOnlyInput) => {
    const email = normalizeEmail(input.email);
    // Gop chung 1 ly do (qua som / khong co yeu cau nao) de khong lo thong tin email.
    const tooSoon = new AppError(
      400,
      "RESEND_TOO_SOON",
      `Không có yêu cầu nào đang chờ, hoặc bạn cần đợi tối đa ${OTP_RESEND_COOLDOWN_SECONDS} giây trước khi gửi lại mã`,
    );

    const user = await findUserByEmail(email);

    if (!user || user.deletedAt) {
      throw tooSoon;
    }

    if (!(await hasPendingOtp("forgot_password", email))) {
      throw tooSoon;
    }

    if ((await getResendCooldown("forgot_password", email)) > 0) {
      throw tooSoon;
    }

    const code = await issueOtp("forgot_password", email);
    await sendOtpMail(email, code, "forgot_password");
  },

  /** 4.1 POST /oauth/google */
  loginWithGoogle: async (input: GoogleLoginInput): Promise<LoginResult> => {
    let profile: Awaited<ReturnType<typeof verifyGoogleIdToken>>;

    try {
      profile = await verifyGoogleIdToken(input.idToken);
    } catch (error) {
      console.error("Google id token verification failed:", error);
      throw new AppError(401, "INVALID_GOOGLE_TOKEN", "Google id token không hợp lệ");
    }

    const email = normalizeEmail(profile.email);

    // 2. Da tung dang nhap Google -> lay thang user da lien ket.
    const linked = await oauthRepo().findOne({
      where: { provider: GOOGLE_PROVIDER, providerUserId: profile.providerUserId },
      relations: { user: { role: true } },
    });

    if (linked) {
      const user = linked.user;

      if (user.deletedAt) {
        throw new AppError(401, "INVALID_GOOGLE_TOKEN", "Tài khoản không tồn tại");
      }

      if (user.status === UserStatus.BANNED) {
        throw new AppError(403, "ACCOUNT_BANNED", "Tài khoản đã bị khoá");
      }

      return issueLogin(user);
    }

    // 3. Chua lien ket -> tim theo email.
    const existing = await findUserByEmail(email);

    if (existing && !existing.deletedAt) {
      if (existing.status === UserStatus.BANNED) {
        throw new AppError(403, "ACCOUNT_BANNED", "Tài khoản đã bị khoá");
      }

      await oauthRepo().save(
        oauthRepo().create({
          user: existing,
          provider: GOOGLE_PROVIDER,
          providerUserId: profile.providerUserId,
        }),
      );

      // Google da xac minh email ho -> coi nhu email da verified.
      if (!existing.emailVerifiedAt) {
        existing.emailVerifiedAt = new Date();
        await userRepo().update({ id: existing.id }, { emailVerifiedAt: existing.emailVerifiedAt });
      }

      await clearOtp("register", email);

      return issueLogin(existing);
    }

    if (existing?.deletedAt) {
      throw new AppError(401, "INVALID_GOOGLE_TOKEN", "Tài khoản không tồn tại");
    }

    // Lan dau dang nhap Google -> bat buoc chon role de tao tai khoan.
    if (!input.role) {
      throw new AppError(
        400,
        "ROLE_REQUIRED",
        "Lần đầu đăng nhập bằng Google cần chọn role CANDIDATE hoặc RECRUITER",
      );
    }

    const role = await resolveRole(input.role);
    const created = await userRepo().save(
      userRepo().create({
        email,
        passwordHash: null,
        fullName: profile.fullName || email.split("@")[0],
        role,
        avatar: profile.avatar && profile.avatar.length <= 255 ? profile.avatar : null,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(), // tin tuong Google da xac minh email
      }),
    );

    await oauthRepo().save(
      oauthRepo().create({
        user: created,
        provider: GOOGLE_PROVIDER,
        providerUserId: profile.providerUserId,
      }),
    );

    created.role = role;

    return issueLogin(created);
  },

  health: () => ({ module: "auth", ready: true, roles: [ROLES.CANDIDATE, ROLES.RECRUITER] }),
};
