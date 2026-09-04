import { http } from "./http";

export type RecentJob = {
  id: string;
  title: string;
  slug: string;
  company: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  status: string;
  createdAt: string;
};

export type RecentSystemLog = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  targetLabel: string | null;
  description: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  createdAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const adminDashboardService = {
  /** Lấy danh sách 5 tin tuyển dụng mới nhất */
  async getRecentJobs(limit = 5): Promise<RecentJob[]> {
    try {
      const res = await http<ApiResponse<PaginatedResponse<RecentJob>>>(
        `/admin/jobs?page=1&limit=${limit}`
      );
      return res.data?.items || [];
    } catch {
      return [];
    }
  },

  /** Lấy danh sách 5 hoạt động hệ thống gần nhất */
  async getRecentLogs(limit = 5): Promise<RecentSystemLog[]> {
    try {
      const res = await http<ApiResponse<PaginatedResponse<RecentSystemLog>>>(
        `/admin/system-logs?page=1&limit=${limit}`
      );
      return res.data?.items || [];
    } catch {
      return [];
    }
  },
};
