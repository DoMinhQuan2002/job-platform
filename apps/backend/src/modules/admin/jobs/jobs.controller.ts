import { Request, Response } from "express";
import { AppError } from "@/common/errors/app-error";
import { validateIdParam, validateListQuery, validateReasonBody } from "./jobs.validation";
import { adminJobsService } from "./jobs.service";

/** `requireAdmin` đã chạy trước, nhưng TypeScript không biết điều đó qua ranh giới middleware. */
const getAdminId = (req: Request): string => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ");
  }
  return req.user.id;
};

export const jobsController = {
  list: async (req: Request, res: Response) => {
    const query = validateListQuery(req.query as Record<string, unknown>);
    const result = await adminJobsService.list(query);

    res.status(200).json({ success: true, message: "Thành công", data: result });
  },

  detail: async (req: Request, res: Response) => {
    const id = validateIdParam(req.params);
    const job = await adminJobsService.detail(id);

    res.status(200).json({ success: true, message: "Thành công", data: job });
  },

  approve: async (req: Request, res: Response) => {
    const adminId = getAdminId(req);
    const id = validateIdParam(req.params);
    const job = await adminJobsService.approve(adminId, id);

    res.status(200).json({ success: true, message: "Đã duyệt tin tuyển dụng", data: job });
  },

  reject: async (req: Request, res: Response) => {
    const adminId = getAdminId(req);
    const id = validateIdParam(req.params);
    const reason = validateReasonBody(req.body);
    const job = await adminJobsService.reject(adminId, id, reason);

    res.status(200).json({ success: true, message: "Đã từ chối tin tuyển dụng", data: job });
  },

  remove: async (req: Request, res: Response) => {
    const adminId = getAdminId(req);
    const id = validateIdParam(req.params);
    const reason = validateReasonBody(req.body);
    await adminJobsService.remove(adminId, id, reason);

    res.status(200).json({ success: true, message: "Đã xóa tin tuyển dụng", data: null });
  },
};
