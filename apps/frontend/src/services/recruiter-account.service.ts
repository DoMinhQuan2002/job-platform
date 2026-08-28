import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";

export type RecruiterAccount = {
  id: string;
  email: string;
  fullName: string;
  role: "RECRUITER";
  phone: string | null;
  avatar: string | null;
  dateOfBirth: string | null;
  addressDetail: string | null;
  wardCode: string | null;
};

export const recruiterAccountApi = {
  getMe: (signal?: AbortSignal) =>
    http<ApiSuccess<RecruiterAccount>>("/users/me", { signal }),
};
