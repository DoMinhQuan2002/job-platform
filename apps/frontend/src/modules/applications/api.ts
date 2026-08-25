import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";
import type { Application, ApplyJobInput, SavedJob } from "./types";

export const applicationsApi = {
  apply: (jobId: string, body: ApplyJobInput = {}) =>
    http<ApiSuccess<Application>>(`/jobs/${jobId}/apply`, { method: "POST", body }),

  list: (query?: Record<string, string>) => {
    const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
    return http<ApiSuccess<Application[]>>(`/applications${qs}`);
  },

  getById: (id: string) => http<ApiSuccess<Application>>(`/applications/${id}`),

  withdraw: (id: string) =>
    http<ApiSuccess<Application>>(`/applications/${id}/withdraw`, { method: "POST" }),

  updateStatus: (id: string, status: string) =>
    http<ApiSuccess<Application>>(`/applications/${id}/status`, {
      method: "PUT",
      body: { status },
    }),

  saveJob: (jobId: string) =>
    http<ApiSuccess<SavedJob>>(`/jobs/${jobId}/save`, { method: "POST" }),

  unsaveJob: (jobId: string) =>
    http<ApiSuccess<null>>(`/jobs/${jobId}/save`, { method: "DELETE" }),

  listSavedJobs: () => http<ApiSuccess<SavedJob[]>>("/saved-jobs"),
};
