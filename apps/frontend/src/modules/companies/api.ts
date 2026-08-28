import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";
import type {
  CompaniesResponse1,
  CompaniesResponse,
  Company,
  CompanyListQuery,
  CompanyProfileInput,
} from "./types";

export type CompanyLogoUploadResponse = {
  fileName: string;
  mimeType: string;
  size: number;
  assetType: "company_logo";
  storagePath: string;
  isPublic: boolean;
  url: string | null;
  expiresIn: number | null;
};

export const companiesApi1 = {
  list: (query: CompanyListQuery = {}) => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.search?.trim()) params.set("search", query.search.trim());
    if (query.companySize) params.set("companySize", query.companySize);

    const qs = params.toString();
    return http<ApiSuccess<CompaniesResponse1>>(`/companies${qs ? `?${qs}` : ""}`, {
      skipAuth: true,
    });
  },

  getById: (idOrSlug: string) =>
    http<ApiSuccess<Company>>(`/companies/${idOrSlug}`, {
      skipAuth: true,
    }),

  getMine: (signal?: AbortSignal) =>
    http<ApiSuccess<Company>>("/companies/me", { signal }),

  create: (body: CompanyProfileInput) =>
    http<ApiSuccess<Company>>("/companies", {
      method: "POST",
      body,
    }),

  updateMine: (body: CompanyProfileInput) =>
    http<ApiSuccess<Company>>("/companies/me", {
      method: "PUT",
      body,
    }),

  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append("assetType", "company_logo");
    form.append("file", file);
    return http<{ data: CompanyLogoUploadResponse }>("/media/uploads", {
      method: "POST",
      body: form,
    });
  },

  getLogoAccessUrl: (storagePath: string) => {
    const qs = new URLSearchParams({
      storagePath,
      assetType: "company_logo",
    });
    return http<{ data: { url: string; storagePath: string; assetType: "company_logo" } }>(
      `/media/access?${qs.toString()}`,
    );
  },
};

export const companiesApi = {
  list: (limit = 5, signal?: AbortSignal) =>
    http<CompaniesResponse>(`/companies?page=1&limit=${limit}`, { skipAuth: true, signal }),
};
