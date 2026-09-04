import { Between, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "@/data-source";
import { AppError } from "@/common/errors/app-error";
import { ApplicationEntity } from "@/database/entities/application.entity";
import { NotificationEntity } from "@/database/entities/notification.entity";
import { ListQuery } from "./notifications.validation";

const repo = () => AppDataSource.getRepository(NotificationEntity);
const applicationRepo = () => AppDataSource.getRepository(ApplicationEntity);

export type NotificationJobInfo = {
  id: string;
  title: string;
  slug: string;
  address: string;
  jobType: string;
  jobMode: string;
  salaryMin: string | null;
  salaryMax: string | null;
  isNegotiable: boolean;
  company: { id: string; name: string; logo: string | null };
  applicationId: string;
  applicationStatus: string;
};

export type NotificationDetail = NotificationEntity & { job: NotificationJobInfo | null };

/**
 * Chỉ APPLICATION_STATUS_CHANGED (target APPLICATION) mới JOIN được sang job/company —
 * các loại còn lại (ACCOUNT_*, COMPANY_*, JOB_*) không có card công việc để hiện.
 */
const loadJobInfo = async (notification: NotificationEntity): Promise<NotificationJobInfo | null> => {
  if (
    notification.type !== "APPLICATION_STATUS_CHANGED" ||
    notification.targetType !== "APPLICATION" ||
    !notification.targetId
  ) {
    return null;
  }

  const application = await applicationRepo().findOne({
    where: { id: notification.targetId },
    relations: { job: { company: true } },
  });
  if (!application) return null;

  const { job } = application;
  return {
    id: job.id,
    title: job.title,
    slug: job.slug,
    address: job.address,
    jobType: job.jobType,
    jobMode: job.jobMode,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    isNegotiable: job.isNegotiable,
    company: { id: job.company.id, name: job.company.name, logo: job.company.logo },
    applicationId: application.id,
    applicationStatus: application.status,
  };
};

export type PaginatedNotifications = {
  items: NotificationEntity[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export const notificationsService = {
  async list(userId: string, query: ListQuery): Promise<PaginatedNotifications> {
    const where: Record<string, unknown> = { userId };
    if (query.isRead !== undefined) where.isRead = query.isRead;
    if (query.type !== undefined) where.type = In(query.type);

    if (query.from !== undefined && query.to !== undefined) {
      where.createdAt = Between(query.from, query.to);
    } else if (query.from !== undefined) {
      where.createdAt = MoreThanOrEqual(query.from);
    } else if (query.to !== undefined) {
      where.createdAt = LessThanOrEqual(query.to);
    }

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

  async getDetail(userId: string, id: string): Promise<NotificationDetail> {
    const notification = await repo().findOneBy({ id, userId });
    if (!notification) {
      throw new AppError(404, "NOT_FOUND", "Không tìm thấy thông báo");
    }

    const job = await loadJobInfo(notification);
    return { ...notification, job };
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
