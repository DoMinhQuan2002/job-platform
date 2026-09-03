import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/modules/auth/auth.service", () => ({
  authService: {
    register: vi.fn(),
    verifyRegisterCode: vi.fn(),
    resendRegisterCode: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    forgotPassword: vi.fn(),
    verifyForgotPasswordCode: vi.fn(),
    resetPassword: vi.fn(),
    resendForgotPasswordCode: vi.fn(),
    loginWithGoogle: vi.fn(),
    health: vi.fn(() => ({ module: "auth", ready: true })),
  },
}));

import app from "../src/app";
import { AppError } from "../src/common/errors/app-error";
import { signAccessToken } from "../src/common/security/jwt";
import { authService } from "../src/modules/auth/auth.service";

const mocked = vi.mocked(authService);

const loginResult = {
  accessToken: "access-token",
  expiresIn: 900,
  refreshToken: "refresh-token-value",
  user: { id: 1024, email: "a@example.com", fullName: "Nguyen Van A", role: "CANDIDATE" },
};

const getCookie = (res: request.Response, name: string) =>
  (res.headers["set-cookie"] as unknown as string[] | undefined)?.find((cookie) =>
    cookie.startsWith(`${name}=`),
  );

beforeEach(() => {
  process.env.JWT_ACCESS_SECRET = "test-secret";
  process.env.COOKIE_SECURE = "false";
});

describe("POST /api/v1/register", () => {
  it("trả 201 kèm envelope thành công", async () => {
    mocked.register.mockResolvedValue({ email: "a@example.com", otpExpiresIn: 300 });

    const res = await request(app).post("/api/v1/register").send({
      email: "A@Example.com",
      password: "Abcd1234",
      fullName: "Nguyen Van A",
      role: "CANDIDATE",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ email: "a@example.com", otpExpiresIn: 300 });
    // email được chuẩn hoá lowercase trước khi vào service
    expect(mocked.register).toHaveBeenCalledWith(
      expect.objectContaining({ email: "a@example.com" }),
    );
  });

  it("trả 400 với envelope lỗi khi password yếu", async () => {
    const res = await request(app).post("/api/v1/register").send({
      email: "a@example.com",
      password: "abcd",
      fullName: "Nguyen Van A",
      role: "CANDIDATE",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some((e: { field: string }) => e.field === "password")).toBe(true);
    expect(mocked.register).not.toHaveBeenCalled();
  });

  it("từ chối role ADMIN khi đăng ký công khai", async () => {
    const res = await request(app).post("/api/v1/register").send({
      email: "a@example.com",
      password: "Abcd1234",
      fullName: "Nguyen Van A",
      role: "ADMIN",
    });

    expect(res.status).toBe(400);
    expect(mocked.register).not.toHaveBeenCalled();
  });
});

describe("POST /api/v1/login", () => {
  it("đặt refresh token vào httpOnly cookie và không trả trong body", async () => {
    mocked.login.mockResolvedValue(loginResult);

    const res = await request(app)
      .post("/api/v1/login")
      .send({ email: "a@example.com", password: "Abcd1234" });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBe("access-token");
    expect(JSON.stringify(res.body)).not.toContain("refresh-token-value");

    const cookie = getCookie(res, "refresh_token");
    expect(cookie).toContain("refresh_token=refresh-token-value");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Path=/api/v1");
  });
});

describe("POST /api/v1/logout", () => {
  it("trả 401 khi thiếu access token", async () => {
    const res = await request(app).post("/api/v1/logout");

    expect(res.status).toBe(401);
    expect(mocked.logout).not.toHaveBeenCalled();
  });

  it("thu hồi session và xoá cookie khi hợp lệ", async () => {
    mocked.logout.mockResolvedValue(undefined);
    const accessToken = signAccessToken({ sub: "1024", email: "a@example.com", role: "CANDIDATE" });

    const res = await request(app)
      .post("/api/v1/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", "refresh_token=refresh-token-value");

    expect(res.status).toBe(200);
    expect(mocked.logout).toHaveBeenCalledWith("1024", "refresh-token-value");
    expect(getCookie(res, "refresh_token")).toContain("refresh_token=;");
  });
});

describe("POST /api/v1/refresh-token", () => {
  it("đọc refresh token từ cookie, không cần Bearer", async () => {
    mocked.refreshToken.mockResolvedValue({ accessToken: "new-access", expiresIn: 900 });

    const res = await request(app)
      .post("/api/v1/refresh-token")
      .set("Cookie", "refresh_token=refresh-token-value");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ accessToken: "new-access", expiresIn: 900 });
    expect(mocked.refreshToken).toHaveBeenCalledWith("refresh-token-value");
  });

  it("gọi service với undefined khi không có cookie", async () => {
    mocked.refreshToken.mockRejectedValue(
      new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token không hợp lệ hoặc đã hết hạn"),
    );

    const res = await request(app).post("/api/v1/refresh-token");

    expect(res.status).toBe(401);
    expect(mocked.refreshToken).toHaveBeenCalledWith(undefined);
  });
});

describe("POST /api/v1/forgot-password", () => {
  it("luôn trả 200 dù email có tồn tại hay không", async () => {
    mocked.forgotPassword.mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/v1/forgot-password")
      .send({ email: "khong-ton-tai@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({});
  });
});

describe("POST /api/v1/oauth/google", () => {
  it("trả 400 khi thiếu idToken", async () => {
    const res = await request(app).post("/api/v1/oauth/google").send({ role: "CANDIDATE" });

    expect(res.status).toBe(400);
    expect(mocked.loginWithGoogle).not.toHaveBeenCalled();
  });

  it("trả về access token + cookie giống luồng /login", async () => {
    mocked.loginWithGoogle.mockResolvedValue(loginResult);

    const res = await request(app)
      .post("/api/v1/oauth/google")
      .send({ idToken: "google-id-token", role: "CANDIDATE" });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe("CANDIDATE");
    expect(getCookie(res, "refresh_token")).toContain("HttpOnly");
  });
});
