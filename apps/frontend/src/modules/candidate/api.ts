import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";
import type {
  AccountUser,
  CandidateProfile,
  Education,
  UpdateCandidateProfileInput,
  WorkExperience,
} from "./types";

export const candidateApi = {
  /** G1 account — fullName / avatar (không lẫn vào PUT /candidates/me) */
  getAccountMe: () => http<ApiSuccess<AccountUser>>("/users/me"),

  /** G1 — multipart field `avatar` (JPEG/PNG/WebP, ≤5MB) */
  uploadAvatar: (file: File) => {
    const body = new FormData();
    body.append("avatar", file);
    return http<ApiSuccess<{ avatar: string }>>("/users/me/avatar", {
      method: "POST",
      body,
    });
  },

  deleteAvatar: () =>
    http<ApiSuccess<{ avatar: null }>>("/users/me/avatar", { method: "DELETE" }),

  getMe: () => http<ApiSuccess<CandidateProfile>>("/candidates/me"),

  updateMe: (body: UpdateCandidateProfileInput) =>
    http<ApiSuccess<CandidateProfile>>("/candidates/me", { method: "PUT", body }),

  listEducations: () => http<ApiSuccess<Education[]>>("/candidates/me/educations"),

  createEducation: (body: Partial<Education>) =>
    http<ApiSuccess<Education>>("/candidates/me/educations", { method: "POST", body }),

  updateEducation: (id: string, body: Partial<Education>) =>
    http<ApiSuccess<Education>>(`/candidates/me/educations/${id}`, { method: "PUT", body }),

  deleteEducation: (id: string) =>
    http<ApiSuccess<null>>(`/candidates/me/educations/${id}`, { method: "DELETE" }),

  listWorkExperiences: () =>
    http<ApiSuccess<WorkExperience[]>>("/candidates/me/work-experiences"),

  createWorkExperience: (body: Partial<WorkExperience>) =>
    http<ApiSuccess<WorkExperience>>("/candidates/me/work-experiences", {
      method: "POST",
      body,
    }),

  updateWorkExperience: (id: string, body: Partial<WorkExperience>) =>
    http<ApiSuccess<WorkExperience>>(`/candidates/me/work-experiences/${id}`, {
      method: "PUT",
      body,
    }),

  deleteWorkExperience: (id: string) =>
    http<ApiSuccess<null>>(`/candidates/me/work-experiences/${id}`, { method: "DELETE" }),
};
