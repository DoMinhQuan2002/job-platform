import { Request } from "express";
import { AppError } from "../errors/app-error";

type AuthUser = NonNullable<Request["user"]>;

export const requireCandidate = (req: Request): AuthUser => {
  if (!req.user?.id) {
    throw new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ");
  }
  if (req.user.role !== "CANDIDATE") {
    throw new AppError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này");
  }
  return req.user;
};
