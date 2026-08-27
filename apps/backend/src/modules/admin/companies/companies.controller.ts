// Handler HTTP cho 5 API quản lý công ty: validate input, gọi service, trả JSON.
import { Request, Response } from "express";
import { AppError } from "@/common/errors/app-error";
import {
  validateIdParam,
  validateListQuery,
  validateReasonBody,
  validateStatusBody,
} from "./companies.validation";
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

  approve: async (req: Request, res: Response) => {
    const adminId = getAdminId(req);
    const id = validateIdParam(req.params);
    const company = await adminCompaniesService.approve(adminId, id);

    res.status(200).json({ success: true, message: "Đã duyệt hồ sơ công ty", data: company });
  },

  reject: async (req: Request, res: Response) => {
    const adminId = getAdminId(req);
    const id = validateIdParam(req.params);
    const reason = validateReasonBody(req.body);
    const company = await adminCompaniesService.reject(adminId, id, reason);

    res.status(200).json({ success: true, message: "Đã từ chối hồ sơ công ty", data: company });
  },
};
