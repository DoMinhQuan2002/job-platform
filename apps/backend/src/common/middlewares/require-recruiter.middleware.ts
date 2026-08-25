import type { NextFunction, Request, Response } from "express";
import { ROLES } from "../constants/roles";
import { AppError } from "../errors/app-error";

/**
 * Middleware yêu cầu người dùng phải có vai trò RECRUITER
 * Dùng sau middleware `authenticate`
 */
export const requireRecruiter = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ"));
  }

  if (req.user.role !== ROLES.RECRUITER) {
    return next(new AppError(403, "FORBIDDEN", "Chỉ tài khoản RECRUITER mới có quyền thực hiện thao tác này"));
  }

  next();
};
