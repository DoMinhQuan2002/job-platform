import { http } from "@/services/http";
import type { JobCategoriesResponse, JobFilters, JobsResponse } from "./types";
import { SavedJobRecord } from "../applications/types";

export const jobsApi = {
  list: (filters: JobFilters, signal?: AbortSignal) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined) query.set(key, String(value));
    });
    return http<JobsResponse>(`/jobs?${query.toString()}`, { signal });
  },
  listCategories: (signal?: AbortSignal) =>
    http<JobCategoriesResponse>("/job-categories", { skipAuth: true, signal }),

  saveJob: (jobId: string, signal?: AbortSignal) =>
    http<SavedJobRecord>(`/jobs/${jobId}/save`, { method: "POST", signal }),
  unsaveJob: (jobId: string, signal?: AbortSignal) =>
    http<null>(`/jobs/${jobId}/save`, { method: "DELETE", signal }),
};
