import { NextFunction, Request, Response } from "express";
import { AppError } from "@/common/errors/app-error";

/**
 * TẠM THỜI — giả lập việc xác thực bằng cách đọc thẳng header, không xác thực gì cả.
 * Sẽ bị thay bằng middleware xác thực thật của Nhóm 1 khi họ hoàn thành `modules/auth`.
 * Contract `req.user = { id, role }` giữ nguyên nên phần còn lại của module không cần sửa.
 */
export const fakeAuth = (req: Request, _res: Response, next: NextFunction) => {
  const id = req.headers["x-user-id"];
  const role = req.headers["x-user-role"];

  if (typeof id === "string" && typeof role === "string") {
    req.user = { id, role: role as "CANDIDATE" | "RECRUITER" | "ADMIN" };
  }

  next();
};

/**
 * Chỉ yêu cầu đã đăng nhập, không phân biệt role.
 * Không phụ thuộc cách `req.user` được gán — không cần sửa khi thay `fakeAuth`.
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ");
  }

  next();
};
