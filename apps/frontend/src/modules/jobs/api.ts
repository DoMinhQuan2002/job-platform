import { http } from "@/services/http";
import type { JobCategoriesResponse, JobFilters, JobsResponse } from "./types";

export const jobsApi = {
  list: (filters: JobFilters, signal?: AbortSignal) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined) query.set(key, String(value));
    });
    return http<JobsResponse>(`/jobs?${query.toString()}`, { skipAuth: true, signal });
  },
  listCategories: (signal?: AbortSignal) =>
    http<JobCategoriesResponse>("/job-categories", { skipAuth: true, signal }),
};
