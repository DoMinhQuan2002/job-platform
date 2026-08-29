import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";
import type { CandidateProfile } from "@/modules/candidate/types";

export type RecruiterApplicationStatus =
  | "APPLIED"
  | "VIEWED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export type RecruiterApplication = {
  id: string;
  candidateId: string;
  jobId: string;
  resumeId: string | null;
  resumeSnapshotUrl: string | null;
  status: RecruiterApplicationStatus;
  appliedAt: string;
  createdAt?: string;
  updatedAt?: string;
  candidate?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    experienceCount: number;
  };
  job?: {
    id: string;
    title: string;
  };
  resume?: {
    id: string;
    fileName: string;
  } | null;
};

export type RecruiterApplicationDetail = RecruiterApplication & {
  candidateProfile?: CandidateProfile & {
    fullName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    dateOfBirth: string | null;
    addressDetail: string | null;
  };
};

type MediaAccessData = {
  url: string;
  storagePath: string;
  assetType: string;
};

export const recruiterApplicationsApi = {
  list: (
    query?: {
      status?: RecruiterApplicationStatus;
      jobId?: string;
      page?: number;
      limit?: number;
    },
    signal?: AbortSignal,
  ) => {
    const params = new URLSearchParams();
    if (query?.status) params.set("status", query.status);
    if (query?.jobId) params.set("jobId", query.jobId);
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    const qs = params.toString();

    return http<ApiSuccess<RecruiterApplication[]>>(
      `/applications${qs ? `?${qs}` : ""}`,
      { signal },
    );
  },

  updateStatus: (id: string, status: Exclude<RecruiterApplicationStatus, "WITHDRAWN">) =>
    http<ApiSuccess<RecruiterApplication>>(`/applications/${id}/status`, {
      method: "PUT",
      body: { status },
    }),

  detail: (id: string, signal?: AbortSignal) =>
    http<ApiSuccess<RecruiterApplicationDetail>>(`/applications/${id}`, { signal }),

  getResumeSnapshotUrl: (storagePath: string) => {
    const qs = new URLSearchParams({
      storagePath,
      assetType: "resume",
    });
    return http<{ data: MediaAccessData }>(`/media/access?${qs.toString()}`);
  },
};
