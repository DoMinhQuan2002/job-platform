import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { verifyAccessToken } from "../security/jwt";

const unauthorized = () =>
  new AppError(401, "UNAUTHORIZED", "Access token không hợp lệ hoặc đã hết hạn");

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    next(unauthorized());
    return;
  }

  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length).trim());
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    next(unauthorized());
  }
};

/**
 * Xác thực tùy chọn cho API public.
 * Không có hoặc token không hợp lệ thì tiếp tục như khách; token hợp lệ sẽ gắn req.user.
 */
export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length).trim());
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    // Đây là API public: token cũ/sai được xem như chưa đăng nhập.
  }
  next();
};
