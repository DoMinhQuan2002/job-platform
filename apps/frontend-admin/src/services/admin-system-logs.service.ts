import { http } from "./http";

export type LogActionType =
  | "LOCK_USER"
  | "UNLOCK_USER"
  | "LOCK_COMPANY"
  | "UNLOCK_COMPANY"
  | "APPROVE_COMPANY"
  | "REJECT_COMPANY"
  | "APPROVE_JOB"
  | "REJECT_JOB"
  | "DELETE_JOB"
  | "CREATE_JOB_CATEGORY"
  | "UPDATE_JOB_CATEGORY"
  | "DELETE_JOB_CATEGORY"
  | "LOGIN_FAILED"
  | "UPDATE_APPLICATION_STATUS"
  | string;

export type SystemLogUser = {
  id: string;
  fullName: string;
  email: string;
};

export type SystemLogItem = {
  id: string;
  action: LogActionType;
  targetType: "USER" | "COMPANY" | "JOB" | "JOB_CATEGORY" | string | null;
  targetId: string | null;
  targetLabel: string | null;
  oldValue: string | null;
  newValue: string | null;
  description: string | null;
  ipAddress: string | null;
  user: SystemLogUser | null;
  createdAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SystemLogsResponse = {
  success: boolean;
  message: string;
  data: {
    items: SystemLogItem[];
    pagination: PaginationMeta;
  };
};

export type SystemLogDetailResponse = {
  success: boolean;
  message: string;
  data: SystemLogItem;
};

export type GetSystemLogsParams = {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  fromDate?: string;
  toDate?: string;
};

export const adminSystemLogsApi = {
  /**
   * Lấy danh sách nhật ký hệ thống kèm phân trang và bộ lọc
   */
  async list(
    params: GetSystemLogsParams = {},
    signal?: AbortSignal
  ): Promise<{
    items: SystemLogItem[];
    pagination: PaginationMeta;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.userId) query.set("userId", params.userId);
    if (params.action && params.action !== "ALL") query.set("action", params.action);
    if (params.targetType && params.targetType !== "ALL") query.set("targetType", params.targetType);
    if (params.targetId) query.set("targetId", params.targetId);
    if (params.fromDate) query.set("fromDate", params.fromDate);
    if (params.toDate) query.set("toDate", params.toDate);

    const queryString = query.toString();
    const endpoint = queryString
      ? `/admin/system-logs?${queryString}`
      : "/admin/system-logs";

    const res = await http<SystemLogsResponse>(endpoint, { signal });
    return res.data;
  },

  /**
   * Lấy chi tiết một bản ghi nhật ký theo ID
   */
  async detail(id: string, signal?: AbortSignal): Promise<SystemLogItem> {
    const res = await http<SystemLogDetailResponse>(`/admin/system-logs/${id}`, {
      signal,
    });
    return res.data;
  },
};
