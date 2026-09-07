import { http } from "./http";

export type AdminJobStatus = "PENDING" | "APPROVED" | "REJECTED" | "CLOSED";

export type JobType = "FULL_TIME" | "PART_TIME";
export type JobMode = "ONSITE" | "REMOTE" | "HYBRID";

export type AdminJobListItem = {
  id: string;
  code?: string;
  title: string;
  slug: string;
  company: { id: string; name: string };
  category: { id: string; name: string };
  jobType: JobType;
  jobMode: JobMode;
  salaryMin: number | string | null;
  salaryMax: number | string | null;
  isNegotiable: boolean;
  quantity: number | null;
  deadline: string;
  status: AdminJobStatus;
  rejectReason: string | null;
  createdAt: string;
};

export type AdminJobSkill = {
  id: string;
  name: string;
  isRequired: boolean;
};

export type AdminJobDetail = AdminJobListItem & {
  description: string;
  requirements: string;
  benefits: string | null;
  address: string;
  experience: number | null;
  skills: AdminJobSkill[];
  updatedAt: string | null;
};

export type AdminJobsResponse = {
  items: AdminJobListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminJobsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminJobStatus;
  companyId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
};

export type JobCategoryOption = {
  id: string;
  name: string;
  slug?: string;
};

export type CompanyOption = {
  id: string;
  name: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const adminJobsApi = {
  /**
   * Lấy danh sách tin tuyển dụng cho admin với bộ lọc và phân trang
   */
  list: async (
    query: AdminJobsQuery = {},
    signal?: AbortSignal
  ): Promise<AdminJobsResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.search) params.set("search", query.search.trim());
    if (query.status) params.set("status", query.status);
    if (query.companyId) params.set("companyId", query.companyId);
    if (query.categoryId) params.set("categoryId", query.categoryId);

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/jobs?${queryString}` : "/admin/jobs";

    const response = await http<ApiResponse<AdminJobsResponse>>(endpoint, {
      signal,
    });
    return response.data;
  },

  /**
   * Xem chi tiết tin tuyển dụng
   */
  detail: async (id: string, signal?: AbortSignal): Promise<AdminJobDetail> => {
    const response = await http<ApiResponse<AdminJobDetail>>(`/admin/jobs/${id}`, {
      signal,
    });
    return response.data;
  },

  /**
   * Phê duyệt tin tuyển dụng (chỉ áp dụng cho tin PENDING)
   */
  approve: async (
    id: string
  ): Promise<{ id: string; status: AdminJobStatus; title?: string }> => {
    const response = await http<
      ApiResponse<{ id: string; title?: string; status: AdminJobStatus }>
    >(`/admin/jobs/${id}/approve`, {
      method: "PUT",
    });
    return response.data;
  },

  /**
   * Từ chối tin tuyển dụng kèm lý do (10 - 500 ký tự)
   */
  reject: async (
    id: string,
    reason: string
  ): Promise<{
    id: string;
    status: AdminJobStatus;
    rejectReason: string;
    title?: string;
  }> => {
    const response = await http<
      ApiResponse<{
        id: string;
        title?: string;
        status: AdminJobStatus;
        rejectReason: string;
      }>
    >(`/admin/jobs/${id}/reject`, {
      method: "PUT",
      body: { reason },
    });
    return response.data;
  },

  /**
   * Xóa mềm tin tuyển dụng (lý do tùy chọn)
   */
  remove: async (id: string, reason?: string): Promise<void> => {
    await http<ApiResponse<null>>(`/admin/jobs/${id}`, {
      method: "DELETE",
      body: reason ? { reason } : undefined,
    });
  },

  /**
   * Danh sách ngành nghề phục vụ dropdown lọc
   */
  listCategories: async (signal?: AbortSignal): Promise<JobCategoryOption[]> => {
    try {
      const response = await http<
        ApiResponse<JobCategoryOption[]> | JobCategoryOption[]
      >("/job-categories", {
        skipAuth: true,
        signal,
      });
      if (Array.isArray(response)) return response;
      if (response && Array.isArray(response.data)) return response.data;
    } catch {
      // Return empty if fails
    }
    return [];
  },

  /**
   * Danh sách công ty phục vụ dropdown lọc
   */
  listCompanies: async (signal?: AbortSignal): Promise<CompanyOption[]> => {
    try {
      const response = await http<
        ApiResponse<{ items: CompanyOption[] }> | ApiResponse<CompanyOption[]>
      >("/admin/companies?limit=100", { signal });
      if (
        response?.data &&
        "items" in response.data &&
        Array.isArray(response.data.items)
      ) {
        return response.data.items.map((c) => ({
          id: String(c.id),
          name: c.name,
        }));
      }
      if (response?.data && Array.isArray(response.data)) {
        return response.data.map((c) => ({
          id: String(c.id),
          name: c.name,
        }));
      }
    } catch {
      try {
        const publicRes = await http<
          | ApiResponse<{ items: CompanyOption[] }>
          | ApiResponse<CompanyOption[]>
        >("/companies?limit=100", {
          skipAuth: true,
          signal,
        });
        if (
          publicRes?.data &&
          "items" in publicRes.data &&
          Array.isArray(publicRes.data.items)
        ) {
          return publicRes.data.items.map((c) => ({
            id: String(c.id),
            name: c.name,
          }));
        }
        if (publicRes?.data && Array.isArray(publicRes.data)) {
          return publicRes.data.map((c) => ({
            id: String(c.id),
            name: c.name,
          }));
        }
      } catch {
        // Return empty if fails
      }
    }
    return [];
  },
};
