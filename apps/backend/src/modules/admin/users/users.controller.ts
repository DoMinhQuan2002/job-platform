// Handler HTTP cho 3 API quản lý tài khoản: validate input, gọi service, trả JSON.
import { Request, Response } from "express";
import { AppError } from "@/common/errors/app-error";
import { validateIdParam, validateListQuery, validateStatusBody } from "./users.validation";
import { adminUsersService } from "./users.service";

/** `requireAdmin` đã chạy trước, nhưng TypeScript không biết điều đó qua ranh giới middleware. */
const getAdminId = (req: Request): string => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ");
  }
  return req.user.id;
};

export const usersController = {
  list: async (req: Request, res: Response) => {
    const query = validateListQuery(req.query as Record<string, unknown>);
    const result = await adminUsersService.list(query);

    res.status(200).json({ success: true, message: "Thành công", data: result });
  },

  detail: async (req: Request, res: Response) => {
    const id = validateIdParam(req.params);
    const user = await adminUsersService.detail(id);

    res.status(200).json({ success: true, message: "Thành công", data: user });
  },

  updateStatus: async (req: Request, res: Response) => {
    const adminId = getAdminId(req);
    const id = validateIdParam(req.params);
    const body = validateStatusBody(req.body);
    const user = await adminUsersService.updateStatus(adminId, id, body);

    res
      .status(200)
      .json({ success: true, message: "Đã cập nhật trạng thái tài khoản", data: user });
  },
};
