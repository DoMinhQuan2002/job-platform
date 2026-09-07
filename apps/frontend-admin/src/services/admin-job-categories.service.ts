import { http } from "./http";
import { adminStatisticsService } from "./admin-statistics.service";

export type JobCategoryStatus = "ACTIVE" | "INACTIVE";

export interface JobCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: JobCategoryStatus;
  totalJobs: number;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JobCategoriesResponse {
  success: boolean;
  message: string;
  data: {
    items: JobCategoryItem[];
    pagination: PaginationMeta;
  };
}

export interface JobCategoryDetailResponse {
  success: boolean;
  message: string;
  data: JobCategoryItem;
}

export interface GetJobCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CreateJobCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateJobCategoryPayload {
  name?: string;
  description?: string;
  status?: JobCategoryStatus;
}

export interface JobCategoryStats {
  total: number;
  active: number;
  inactive: number;
  totalJobs: number;
}

export const adminJobCategoriesApi = {
  /** Lấy danh sách ngành nghề có phân trang, tìm kiếm và lọc trạng thái */
  async list(params: GetJobCategoriesParams = {}, signal?: AbortSignal): Promise<{
    items: JobCategoryItem[];
    pagination: PaginationMeta;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search && params.search.trim()) query.set("search", params.search.trim());
    if (params.status && params.status !== "ALL") query.set("status", params.status);

    const queryString = query.toString();
    const endpoint = queryString ? `/admin/job-categories?${queryString}` : "/admin/job-categories";

    const res = await http<JobCategoriesResponse>(endpoint, { signal });
    return res.data;
  },

  /** Lấy chi tiết ngành nghề theo ID */
  async detail(id: string, signal?: AbortSignal): Promise<JobCategoryItem> {
    const res = await http<JobCategoryDetailResponse>(`/admin/job-categories/${id}`, { signal });
    return res.data;
  },

  /** Tạo mới ngành nghề */
  async create(payload: CreateJobCategoryPayload): Promise<JobCategoryItem> {
    const res = await http<JobCategoryDetailResponse>("/admin/job-categories", {
      method: "POST",
      body: payload,
    });
    return res.data;
  },

  /** Cập nhật ngành nghề */
  async update(id: string, payload: UpdateJobCategoryPayload): Promise<JobCategoryItem> {
    const res = await http<JobCategoryDetailResponse>(`/admin/job-categories/${id}`, {
      method: "PUT",
      body: payload,
    });
    return res.data;
  },

  /** Xóa ngành nghề */
  async remove(id: string): Promise<void> {
    await http<{ success: boolean; message: string; data: null }>(`/admin/job-categories/${id}`, {
      method: "DELETE",
    });
  },

  /** Lấy tổng hợp số liệu thống kê cho 4 thẻ Metric */
  async getStats(): Promise<JobCategoryStats> {
    try {
      const [totalRes, activeRes, inactiveRes, overviewRes] = await Promise.allSettled([
        http<JobCategoriesResponse>("/admin/job-categories?page=1&limit=1"),
        http<JobCategoriesResponse>("/admin/job-categories?page=1&limit=1&status=ACTIVE"),
        http<JobCategoriesResponse>("/admin/job-categories?page=1&limit=1&status=INACTIVE"),
        adminStatisticsService.getOverview(),
      ]);

      const total = totalRes.status === "fulfilled" ? totalRes.value.data.pagination.total : 0;
      const active = activeRes.status === "fulfilled" ? activeRes.value.data.pagination.total : 0;
      const inactive = inactiveRes.status === "fulfilled" ? inactiveRes.value.data.pagination.total : 0;
      const totalJobs = overviewRes.status === "fulfilled" ? overviewRes.value.totalJobs : 0;

      return {
        total,
        active,
        inactive,
        totalJobs,
      };
    } catch {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        totalJobs: 0,
      };
    }
  },
};
