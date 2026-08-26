import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";
import type { CompaniesResponse, Company, CompanyListQuery } from "./types";

export const companiesApi = {
  list: (query: CompanyListQuery = {}) => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.search?.trim()) params.set("search", query.search.trim());
    if (query.companySize) params.set("companySize", query.companySize);

    const qs = params.toString();
    return http<ApiSuccess<CompaniesResponse>>(`/companies${qs ? `?${qs}` : ""}`, {
      skipAuth: true,
    });
  },

  getById: (idOrSlug: string) =>
    http<ApiSuccess<Company>>(`/companies/${idOrSlug}`, {
      skipAuth: true,
    }),
};
