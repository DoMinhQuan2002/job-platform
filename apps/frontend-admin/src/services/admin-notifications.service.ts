import { http } from "./http";

export type NotificationType =
  | "ACCOUNT_LOCKED"
  | "ACCOUNT_UNLOCKED"
  | "COMPANY_LOCKED"
  | "COMPANY_UNLOCKED"
  | "COMPANY_APPROVED"
  | "COMPANY_REJECTED"
  | "JOB_APPROVED"
  | "JOB_REJECTED"
  | "JOB_DELETED"
  | "NEW_APPLICATION"
  | "APPLICATION_STATUS_CHANGED";

export type AdminNotificationCategory = "ALL" | "COMPANY" | "JOB" | "USER";

export const NOTIFICATION_CATEGORY_TYPES: Record<AdminNotificationCategory, NotificationType[] | null> = {
  ALL: null,
  COMPANY: [
    "COMPANY_APPROVED",
    "COMPANY_REJECTED",
    "COMPANY_LOCKED",
    "COMPANY_UNLOCKED",
  ],
  JOB: [
    "JOB_APPROVED",
    "JOB_REJECTED",
    "JOB_DELETED",
    "NEW_APPLICATION",
    "APPLICATION_STATUS_CHANGED",
  ],
  USER: ["ACCOUNT_LOCKED", "ACCOUNT_UNLOCKED"],
};

export type AdminNotificationItem = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  targetType: "JOB" | "COMPANY" | "APPLICATION" | "USER" | null;
  targetId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type AdminNotificationsResponse = {
  items: AdminNotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminNotificationsQuery = {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType[];
  search?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const adminNotificationsApi = {
  /**
   * Lấy danh sách thông báo hệ thống
   */
  list: async (
    query: AdminNotificationsQuery = {},
    signal?: AbortSignal
  ): Promise<AdminNotificationsResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.isRead !== undefined) params.set("isRead", String(query.isRead));
    if (query.type && query.type.length > 0) {
      params.set("type", query.type.join(","));
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/notifications?${queryString}` : "/notifications";

    const response = await http<ApiResponse<AdminNotificationsResponse>>(endpoint, {
      signal,
    });
    return response.data;
  },

  /**
   * Số lượng thông báo chưa đọc
   */
  unreadCount: async (signal?: AbortSignal): Promise<number> => {
    try {
      const response = await http<ApiResponse<{ unreadCount: number }>>(
        "/notifications/unread-count",
        { signal }
      );
      return response.data.unreadCount ?? 0;
    } catch {
      return 0;
    }
  },

  /**
   * Chi tiết 1 thông báo
   */
  detail: async (
    id: string,
    signal?: AbortSignal
  ): Promise<AdminNotificationItem> => {
    const response = await http<ApiResponse<AdminNotificationItem>>(
      `/notifications/${id}`,
      { signal }
    );
    return response.data;
  },

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  markRead: async (id: string): Promise<AdminNotificationItem> => {
    const response = await http<ApiResponse<AdminNotificationItem>>(
      `/notifications/${id}/read`,
      {
        method: "PATCH",
      }
    );
    return response.data;
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllRead: async (): Promise<number> => {
    const response = await http<ApiResponse<{ updatedCount: number }>>(
      "/notifications/read-all",
      {
        method: "PATCH",
      }
    );
    return response.data?.updatedCount ?? 0;
  },

  /**
   * Xóa 1 thông báo
   */
  remove: async (id: string): Promise<void> => {
    await http<ApiResponse<null>>(`/notifications/${id}`, {
      method: "DELETE",
    });
  },
};
