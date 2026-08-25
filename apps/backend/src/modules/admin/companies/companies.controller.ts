// Handler HTTP cho 3 API quản lý công ty: validate input, gọi service, trả JSON.
import { Request, Response } from "express";
import { AppError } from "@/common/errors/app-error";
import { validateIdParam, validateListQuery, validateStatusBody } from "./companies.validation";
import { adminCompaniesService } from "./companies.service";

/** `requireAdmin` đã chạy trước, nhưng TypeScript không biết điều đó qua ranh giới middleware. */
const getAdminId = (req: Request): string => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ");
  }
  return req.user.id;
};

export const companiesController = {
  list: async (req: Request, res: Response) => {
    const query = validateListQuery(req.query as Record<string, unknown>);
    const result = await adminCompaniesService.list(query);

    res.status(200).json({ success: true, message: "Thành công", data: result });
  },

  detail: async (req: Request, res: Response) => {
    const id = validateIdParam(req.params);
    const company = await adminCompaniesService.detail(id);

    res.status(200).json({ success: true, message: "Thành công", data: company });
  },

  updateStatus: async (req: Request, res: Response) => {
    const adminId = getAdminId(req);
    const id = validateIdParam(req.params);
    const body = validateStatusBody(req.body);
    const company = await adminCompaniesService.updateStatus(adminId, id, body);

    res.status(200).json({ success: true, message: "Đã cập nhật trạng thái công ty", data: company });
  },
};
