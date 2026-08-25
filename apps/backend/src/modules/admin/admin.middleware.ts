import { NextFunction, Request, Response } from "express";
import { AppError } from "@/common/errors/app-error";

/**
 * Chỉ ADMIN mới truy cập được. Đứng sau `authenticate` thật.
 * Dùng role check thô, không qua `authorize()` — chưa có permission `admin:*`/`company:*`/
 * `job:*` nào được seed trong bảng `permissions`.
 */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ");
  }
  if (req.user.role !== "ADMIN") {
    throw new AppError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này");
  }

  next();
};
