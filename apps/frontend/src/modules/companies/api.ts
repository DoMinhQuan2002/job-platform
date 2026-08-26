import { http } from "@/services/http";
import type { CompaniesResponse } from "./types";

export const companiesApi = {
  list: (limit = 5, signal?: AbortSignal) =>
    http<CompaniesResponse>(`/companies?page=1&limit=${limit}`, { skipAuth: true, signal }),
};
