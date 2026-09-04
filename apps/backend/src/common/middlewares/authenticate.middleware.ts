import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { verifyAccessToken } from "../security/jwt";

const unauthorized = () =>
  new AppError(401, "UNAUTHORIZED", "Access token không hợp lệ hoặc đã hết hạn");

const extractToken = (req: Request): string | undefined => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }

  const cookieToken =
    req.cookies?.jp_admin_access_token ||
    req.cookies?.jp_access_token ||
    req.cookies?.accessToken ||
    req.cookies?.access_token ||
    req.cookies?.token ||
    req.cookies?.admin_access_token ||
    req.cookies?.admin_token;

  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken.replace(/^Bearer\s+/i, "").trim();
  }

  return undefined;
};

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    next(unauthorized());
    return;
  }

  try {
    const payload = verifyAccessToken(token);
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
  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    // Đây là API public: token cũ/sai được xem như chưa đăng nhập.
  }
  next();
};
