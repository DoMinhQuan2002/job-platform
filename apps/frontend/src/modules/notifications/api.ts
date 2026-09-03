import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";
import type {
  NotificationDetail,
  NotificationItem,
  NotificationListQuery,
  PaginatedNotifications,
} from "./types";

function buildListQuery(query?: NotificationListQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.isRead !== undefined) params.set("isRead", String(query.isRead));
  if (query.type?.length) params.set("type", query.type.join(","));
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const notificationsApi = {
  list: (query?: NotificationListQuery) =>
    http<ApiSuccess<PaginatedNotifications>>(`/notifications${buildListQuery(query)}`),

  getDetail: (id: string) => http<ApiSuccess<NotificationDetail>>(`/notifications/${id}`),

  unreadCount: () => http<ApiSuccess<{ unreadCount: number }>>("/notifications/unread-count"),

  markRead: (id: string) =>
    http<ApiSuccess<NotificationItem>>(`/notifications/${id}/read`, { method: "PATCH" }),

  markAllRead: () =>
    http<ApiSuccess<{ updatedCount: number }>>("/notifications/read-all", { method: "PATCH" }),

  remove: (id: string) => http<ApiSuccess<null>>(`/notifications/${id}`, { method: "DELETE" }),
};
