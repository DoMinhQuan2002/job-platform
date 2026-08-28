import type { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { sendSuccess } from "../../common/http/api-response";
import {
  clearRefreshTokenCookie,
  readRefreshTokenCookie,
  setRefreshTokenCookie,
} from "./auth.cookie";
import { authService, type LoginResult } from "./auth.service";
import type {
  EmailOnlyInput,
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyCodeInput,
} from "./auth.validation";

/** Tra ve access token trong body, refresh token chi di qua httpOnly cookie. */
const respondWithLogin = (
  res: Response,
  message: string,
  result: LoginResult,
) => {
  setRefreshTokenCookie(res, result.refreshToken);

  sendSuccess(res, 200, message, {
    accessToken: result.accessToken,
    expiresIn: result.expiresIn,
    user: result.user,
  });
};

export const authController = {
  register: async (req: Request, res: Response) => {
    const data = await authService.register(req.body as RegisterInput);
    sendSuccess(
      res,
      201,
      "Đăng ký thành công, vui lòng kiểm tra email để lấy mã xác thực",
      data,
    );
  },

  verifyRegisterCode: async (req: Request, res: Response) => {
    const data = await authService.verifyRegisterCode(
      req.body as VerifyCodeInput,
    );
    sendSuccess(
      res,
      200,
      "Xác thực thành công, tài khoản đã được kích hoạt",
      data,
    );
  },

  resendRegisterCode: async (req: Request, res: Response) => {
    const data = await authService.resendRegisterCode(
      req.body as EmailOnlyInput,
    );
    sendSuccess(res, 200, "Đã gửi lại mã xác thực", data);
  },

  login: async (req: Request, res: Response) => {
    const result = await authService.login(req.body as LoginInput);
    respondWithLogin(res, "Đăng nhập thành công", result);
  },

  logout: async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Phiên đăng nhập của ban đã hết hạn hoặc không hợp lệ",
      );
    }

    await authService.logout(req.user.id, readRefreshTokenCookie(req));
    clearRefreshTokenCookie(res);
    sendSuccess(res, 200, "Đăng xuất thành công");
  },

  refreshToken: async (req: Request, res: Response) => {
    const data = await authService.refreshToken(readRefreshTokenCookie(req));
    sendSuccess(res, 200, "Làm mới access token thành công", data);
  },

  forgotPassword: async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body as EmailOnlyInput);
    sendSuccess(
      res,
      200,
      "Nếu email tồn tại trong hệ thống, mã xác thực đã được gửi",
    );
  },

  verifyForgotPasswordCode: async (req: Request, res: Response) => {
    const data = await authService.verifyForgotPasswordCode(
      req.body as VerifyCodeInput,
    );
    sendSuccess(res, 200, "Xác thực thành công", data);
  },

  resetPassword: async (req: Request, res: Response) => {
    await authService.resetPassword(req.body as ResetPasswordInput);
    clearRefreshTokenCookie(res);
    sendSuccess(res, 200, "Đổi mật khẩu thành công");
  },

  resendForgotPasswordCode: async (req: Request, res: Response) => {
    await authService.resendForgotPasswordCode(req.body as EmailOnlyInput);
    sendSuccess(res, 200, "Đã gửi lại mã xác thực");
  },

  loginWithGoogle: async (req: Request, res: Response) => {
    const result = await authService.loginWithGoogle(
      req.body as GoogleLoginInput,
    );
    respondWithLogin(res, "Đăng nhập thành công", result);
  },

  health: (_req: Request, res: Response) => {
    sendSuccess(res, 200, "OK", authService.health());
  },
};
