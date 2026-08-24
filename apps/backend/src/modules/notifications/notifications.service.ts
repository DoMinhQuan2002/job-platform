import { AppDataSource } from "@/data-source";
import { AppError } from "@/common/errors/app-error";
import { NotificationEntity } from "@/database/entities/notification.entity";
import { ListQuery } from "./notifications.validation";

const repo = () => AppDataSource.getRepository(NotificationEntity);

export type PaginatedNotifications = {
  items: NotificationEntity[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export const notificationsService = {
  async list(userId: string, query: ListQuery): Promise<PaginatedNotifications> {
    const where: Record<string, unknown> = { userId };
    if (query.isRead !== undefined) where.isRead = query.isRead;
    if (query.type !== undefined) where.type = query.type;

    const [items, total] = await repo().findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  async unreadCount(userId: string): Promise<number> {
    return repo().count({ where: { userId, isRead: false } });
  },

  async markRead(userId: string, id: string): Promise<NotificationEntity> {
    const notification = await repo().findOneBy({ id, userId });
    if (!notification) {
      throw new AppError(404, "NOT_FOUND", "Không tìm thấy thông báo");
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await repo().save(notification);
    }

    return notification;
  },

  async markAllRead(userId: string): Promise<number> {
    const result = await repo().update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return result.affected ?? 0;
  },

  async remove(userId: string, id: string): Promise<void> {
    const notification = await repo().findOneBy({ id, userId });
    if (!notification) {
      throw new AppError(404, "NOT_FOUND", "Không tìm thấy thông báo");
    }

    await repo().remove(notification);
  },
};
