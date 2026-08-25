import { NextFunction, Request, Response } from "express";
import { AppError } from "@/common/errors/app-error";

/**
 * Chỉ yêu cầu đã đăng nhập, không phân biệt role. Đứng sau `authenticate` thật.
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ");
  }

  next();
};
