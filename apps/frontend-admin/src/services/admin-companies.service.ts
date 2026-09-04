import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";

export type CompanyStatus = "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED";

export type AdminCompany = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  email: string;
  phone: string;
  taxCode: string | null;
  companySize: string | null;
  address: string;
  status: CompanyStatus;
  rejectReason: string | null;
  owner: {
    id: string;
    fullName: string;
    email: string;
  };
  totalJobs: number;
  createdAt: string;
};

export type AdminCompanyDetail = AdminCompany & {
  website: string | null;
  description: string | null;
  updatedAt: string | null;
};

export type AdminCompaniesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminCompaniesStats = {
  total: number;
  active: number;
  blocked: number;
  newThisMonth: number;
};

export type AdminCompaniesResponse = {
  items: AdminCompany[];
  pagination: AdminCompaniesPagination;
  stats: AdminCompaniesStats;
};

export type AdminCompaniesQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: CompanyStatus | "ALL";
  createdFrom?: string;
  createdTo?: string;
};

export type AdminCompanyStatusUpdate = {
  id: string;
  name: string;
  status: CompanyStatus;
  rejectReason?: string | null;
  updatedAt: string | null;
};

type RequestOptions = {
  signal?: AbortSignal;
};

const buildQueryString = (query: AdminCompaniesQuery = {}) => {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.status && query.status !== "ALL") params.set("status", query.status);
  if (query.createdFrom) params.set("createdFrom", query.createdFrom);
  if (query.createdTo) params.set("createdTo", query.createdTo);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const adminCompaniesApi = {
  async list(query?: AdminCompaniesQuery, options?: RequestOptions) {
    const response = await http<ApiSuccess<AdminCompaniesResponse>>(
      `/admin/companies${buildQueryString(query)}`,
      { signal: options?.signal },
    );

    return response.data;
  },

  async detail(id: string, options?: RequestOptions) {
    const response = await http<ApiSuccess<AdminCompanyDetail>>(
      `/admin/companies/${id}`,
      { signal: options?.signal },
    );

    return response.data;
  },

  async updateStatus(
    id: string,
    body: { status: Extract<CompanyStatus, "ACTIVE" | "BLOCKED">; reason?: string },
  ) {
    const response = await http<ApiSuccess<AdminCompanyStatusUpdate>>(
      `/admin/companies/${id}/status`,
      {
        method: "PUT",
        body,
      },
    );

    return response.data;
  },

  async approve(id: string) {
    const response = await http<ApiSuccess<AdminCompanyStatusUpdate>>(
      `/admin/companies/${id}/approve`,
      { method: "PUT" },
    );

    return response.data;
  },

  async reject(id: string, reason: string) {
    const response = await http<ApiSuccess<AdminCompanyStatusUpdate>>(
      `/admin/companies/${id}/reject`,
      {
        method: "PUT",
        body: { reason },
      },
    );

    return response.data;
  },
};
