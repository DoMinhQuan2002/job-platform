import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";

export type RecruiterJobStatus = "PENDING" | "APPROVED" | "OPEN" | "HIDDEN" | "REJECTED" | "CLOSED";

export type RecruiterJob = {
  id: string;
  title: string;
  slug: string;
  salaryMin: number | null;
  salaryMax: number | null;
  isNegotiable: boolean;
  address: string;
  jobType: "FULL_TIME" | "PART_TIME";
  jobMode: "ONSITE" | "REMOTE" | "HYBRID";
  experience: number | null;
  quantity: number | null;
  deadline: string;
  status: RecruiterJobStatus;
  rejectReason: string | null;
  applicantCount: number;
  category: { id: string; name: string; slug: string } | null;
  createdAt: string;
  updatedAt: string | null;
};

export type RecruiterJobsResponse = {
  items: RecruiterJob[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  statusCounts: Record<RecruiterJobStatus, number>;
};

export type ApplicationStatus =
  | "APPLIED"
  | "VIEWED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export type RecruiterJobDetail = RecruiterJob & {
  description: string;
  requirements: string;
  benefits: string | null;
  skills: Array<{ id: string; name: string; isRequired: boolean }>;
  applicationStats: {
    total: number;
    byStatus: Record<ApplicationStatus, number>;
  };
};

export type RecruiterJobInput = {
  companyId: string;
  categoryId: string;
  title: string;
  description: string;
  requirements: string;
  benefits: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  isNegotiable: boolean;
  address: string;
  jobType: "FULL_TIME" | "PART_TIME";
  jobMode: "ONSITE" | "REMOTE" | "HYBRID";
  experience: number;
  quantity: number;
  deadline: string;
  skills: Array<{ skillId: string; isRequired: boolean }>;
};

export type RecruiterCompany = { id: string; name: string; address: string; logo?: string | null };
export type JobCategoryOption = { id: string; name: string; slug: string };
export type SkillOption = { id: string; name: string; category: string; status?: string };

export const recruiterJobsApi = {
  list: (query: { status?: RecruiterJobStatus; page: number; limit: number }, signal?: AbortSignal) => {
    const params = new URLSearchParams({
      page: String(query.page),
      limit: String(query.limit),
    });
    if (query.status) params.set("status", query.status);

    return http<ApiSuccess<RecruiterJobsResponse>>(`/recruiter/jobs?${params.toString()}`, {
      signal,
    });
  },
  detail: (id: string, signal?: AbortSignal) =>
    http<ApiSuccess<RecruiterJobDetail>>(`/recruiter/jobs/${id}`, { signal }),
  updateStatus: (id: string, status: "OPEN" | "CLOSED" | "HIDDEN") =>
    http<ApiSuccess<RecruiterJob>>(`/jobs/${id}`, {
      method: "PATCH",
      body: { status },
    }),
  getCompany: (signal?: AbortSignal) =>
    http<ApiSuccess<RecruiterCompany>>("/companies/me", { signal }),
  listCategories: (signal?: AbortSignal) =>
    http<ApiSuccess<JobCategoryOption[]>>("/job-categories", {
      skipAuth: true,
      signal,
    }),
  listSkills: (signal?: AbortSignal) =>
    http<ApiSuccess<SkillOption[]>>("/skills?category=SKILL", {
      skipAuth: true,
      signal,
    }),
  create: (body: RecruiterJobInput) =>
    http<ApiSuccess<RecruiterJob>>("/jobs", { method: "POST", body }),
  update: (id: string, body: Omit<RecruiterJobInput, "companyId">) =>
    http<ApiSuccess<RecruiterJob>>(`/jobs/${id}`, { method: "PUT", body }),
};
