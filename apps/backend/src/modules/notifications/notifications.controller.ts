import { Request, Response } from "express";
import { AppError } from "@/common/errors/app-error";
import { validateIdParam, validateListQuery } from "./notifications.validation";
import { notificationsService } from "./notifications.service";

/** `requireAuth` đã chạy trước, nhưng TypeScript không biết điều đó qua ranh giới middleware. */
const getUserId = (req: Request): string => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ");
  }
  return req.user.id;
};

export const notificationsController = {
  list: async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const query = validateListQuery(req.query as Record<string, unknown>);
    const result = await notificationsService.list(userId, query);

    res.status(200).json({ success: true, message: "Thành công", data: result });
  },

  detail: async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const id = validateIdParam(req.params);
    const notification = await notificationsService.getDetail(userId, id);

    res.status(200).json({ success: true, message: "Thành công", data: notification });
  },

  unreadCount: async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const unreadCount = await notificationsService.unreadCount(userId);

    res.status(200).json({ success: true, message: "Thành công", data: { unreadCount } });
  },

  markRead: async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const id = validateIdParam(req.params);
    const notification = await notificationsService.markRead(userId, id);

    res.status(200).json({ success: true, message: "Thành công", data: notification });
  },

  markAllRead: async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const updatedCount = await notificationsService.markAllRead(userId);

    res.status(200).json({
      success: true,
      message: "Đã đánh dấu tất cả thông báo là đã đọc",
      data: { updatedCount },
    });
  },

  remove: async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const id = validateIdParam(req.params);
    await notificationsService.remove(userId, id);

    res.status(200).json({ success: true, message: "Đã xóa thông báo", data: null });
  },
};
