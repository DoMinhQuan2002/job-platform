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
  const email = req.headers["x-user-email"];

  if (typeof id === "string" && typeof role === "string" && typeof email === "string") {
    // `email` ép kiểu tạm — chưa thêm vào `common/types/express.d.ts` vì Nhóm 1
    // đang sửa đúng file đó ở nhánh riêng, tránh conflict. Xóa `as any` khi merge xong.
    req.user = { id, role: role as "CANDIDATE" | "RECRUITER" | "ADMIN", email } as any;
  }

  next();
};

/**
 * Chỉ ADMIN mới truy cập được. Không phụ thuộc cách `req.user` được gán —
 * không cần sửa khi thay `fakeAuth`.
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
