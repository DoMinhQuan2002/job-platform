import { Router } from "express";
import { authenticate } from "../../common/middlewares/authenticate.middleware";
import { rateLimit } from "../../common/middlewares/rate-limit.middleware";
import { validateBody } from "../../common/middlewares/validate.middleware";
import { authController } from "./auth.controller";
import {
  emailOnlySchema,
  googleLoginSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyCodeSchema,
} from "./auth.validation";

/**
 * Duong dan khop docs/api-contract/group1/auth.md - router nay duoc mount
 * o goc /api/v1 nen endpoint la /api/v1/register, /api/v1/login, ...
 *
 * rateLimit dat truoc validateBody: chan flood theo IP truoc khi ton cong parse body.
 * Cooldown theo email trong auth.otp.ts la lop thu hai, doc lap voi lop nay.
 */
const authRouter = Router();

const FIFTEEN_MINUTES = 15 * 60;
const ONE_HOUR = 60 * 60;

/** Doan mo tai khoan / spam OTP: sieng het suc cung chi 5 lan moi gio. */
const otpSendLimit = (name: string) =>
  rateLimit({ name, limit: 5, windowSeconds: ONE_HOUR });

/** Do ma OTP hoac do mat khau: 10 lan moi 15 phut. */
const guessLimit = (name: string) =>
  rateLimit({ name, limit: 10, windowSeconds: FIFTEEN_MINUTES });

// 1. Dang ky
authRouter.post(
  "/register",
  otpSendLimit("register"),
  validateBody(registerSchema),
  authController.register,
);
authRouter.post(
  "/register/verify-code",
  guessLimit("register-verify"),
  validateBody(verifyCodeSchema),
  authController.verifyRegisterCode,
);
authRouter.post(
  "/register/resend-code",
  otpSendLimit("register-resend"),
  validateBody(emailOnlySchema),
  authController.resendRegisterCode,
);

// 2. Dang nhap / dang xuat
authRouter.post(
  "/login",
  guessLimit("login"),
  validateBody(loginSchema),
  authController.login,
);
authRouter.post("/logout", authenticate, authController.logout);
authRouter.post(
  "/refresh-token",
  rateLimit({ name: "refresh-token", limit: 30, windowSeconds: FIFTEEN_MINUTES }),
  authController.refreshToken,
);

// 3. Quen mat khau
authRouter.post(
  "/forgot-password",
  otpSendLimit("forgot-password"),
  validateBody(emailOnlySchema),
  authController.forgotPassword,
);
authRouter.post(
  "/forgot-password/verify-code",
  guessLimit("forgot-password-verify"),
  validateBody(verifyCodeSchema),
  authController.verifyForgotPasswordCode,
);
authRouter.post(
  "/forgot-password/reset",
  guessLimit("forgot-password-reset"),
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);
authRouter.post(
  "/forgot-password/resend-code",
  otpSendLimit("forgot-password-resend"),
  validateBody(emailOnlySchema),
  authController.resendForgotPasswordCode,
);

// 4. OAuth Google
authRouter.post(
  "/oauth/google",
  guessLimit("oauth-google"),
  validateBody(googleLoginSchema),
  authController.loginWithGoogle,
);

authRouter.get("/auth/health", authController.health);

export default authRouter;
