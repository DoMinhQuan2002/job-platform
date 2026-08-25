// Handler HTTP cho 5 API quản lý ngành nghề: validate input, gọi service, trả JSON.
import { Request, Response } from "express";
import { AppError } from "@/common/errors/app-error";
import {
  validateCreateBody,
  validateIdParam,
  validateListQuery,
  validateUpdateBody,
} from "./job-categories.validation";
import { adminJobCategoriesService } from "./job-categories.service";

/** `requireAdmin` đã chạy trước, nhưng TypeScript không biết điều đó qua ranh giới middleware. */
const getAdminId = (req: Request): string => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ");
  }
  return req.user.id;
};

export const jobCategoriesController = {
  list: async (req: Request, res: Response) => {
    const query = validateListQuery(req.query as Record<string, unknown>);
    const result = await adminJobCategoriesService.list(query);

    res.status(200).json({ success: true, message: "Thành công", data: result });
  },

  detail: async (req: Request, res: Response) => {
    const id = validateIdParam(req.params);
    const category = await adminJobCategoriesService.detail(id);

    res.status(200).json({ success: true, message: "Thành công", data: category });
  },

  create: async (req: Request, res: Response) => {
    const adminId = getAdminId(req);
    const body = validateCreateBody(req.body);
    const category = await adminJobCategoriesService.create(adminId, body);

    res.status(201).json({ success: true, message: "Đã thêm ngành nghề", data: category });
  },

  update: async (req: Request, res: Response) => {
    const adminId = getAdminId(req);
    const id = validateIdParam(req.params);
    const body = validateUpdateBody(req.body);
    const category = await adminJobCategoriesService.update(adminId, id, body);

    res.status(200).json({ success: true, message: "Đã cập nhật ngành nghề", data: category });
  },

  remove: async (req: Request, res: Response) => {
    const adminId = getAdminId(req);
    const id = validateIdParam(req.params);
    await adminJobCategoriesService.remove(adminId, id);

    res.status(200).json({ success: true, message: "Đã xóa ngành nghề", data: null });
  },
};
