import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";
import type { Application, ApplyJobInput, SavedJobRecord } from "./types";

export type ResumeOption = {
  id: string;
  name?: string;
  title?: string;
  fileName?: string;
  fileSize?: string;
  size?: string;
  updatedAt?: string;
  isDefault?: boolean;
  fileUrl?: string;
  storagePath?: string;
};

export const applicationsApi = {
  apply: (jobId: string, body: ApplyJobInput = {}) =>
    http<ApiSuccess<Application>>(`/jobs/${jobId}/apply`, { method: "POST", body }),

  list: (query?: { status?: string; page?: string; limit?: string }) => {
    const params = new URLSearchParams();
    if (query?.status) params.set("status", query.status);
    if (query?.page) params.set("page", query.page);
    if (query?.limit) params.set("limit", query.limit);
    const qs = params.toString();
    return http<ApiSuccess<Application[]>>(`/applications${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string) => http<ApiSuccess<Application>>(`/applications/${id}`),

  withdraw: (id: string) =>
    http<ApiSuccess<Application>>(`/applications/${id}/withdraw`, { method: "POST" }),

  saveJob: (jobId: string) =>
    http<ApiSuccess<SavedJobRecord>>(`/jobs/${jobId}/save`, { method: "POST" }),

  unsaveJob: (jobId: string) =>
    http<ApiSuccess<null>>(`/jobs/${jobId}/save`, { method: "DELETE" }),

  listSavedJobs: () => http<ApiSuccess<SavedJobRecord[]>>("/saved-jobs"),

  /** CV của candidate — dùng khi apply (module resume) */
  getMyResumes: () => http<ApiSuccess<ResumeOption[]>>("/resumes"),

  /** Enrich title/company — G2 */
  getJobDetail: (jobId: string) => http<ApiSuccess<unknown>>(`/jobs/${jobId}`),
};
