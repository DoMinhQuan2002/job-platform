import type { NextFunction, Request, Response } from "express";
import { ROLES, type RoleValue } from "../constants/roles";
import { AppError } from "../errors/app-error";

/**
 * Middleware phân quyền dựa theo vai trò (Role-Based Access Control)
 * Dùng sau middleware `authenticate`
 */
export const requireRoles = (...allowedRoles: RoleValue[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, "FORBIDDEN", "Chỉ tài khoản RECRUITER mới có quyền thực hiện thao tác này"));
    }

    next();
  };
};

/**
 * Middleware yêu cầu người dùng phải có vai trò RECRUITER
 */
export const requireRecruiter = requireRoles(ROLES.RECRUITER);

/**
 * Middleware yêu cầu người dùng phải có vai trò CANDIDATE
 */
export const requireCandidate = requireRoles(ROLES.CANDIDATE);
