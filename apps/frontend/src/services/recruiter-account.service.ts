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
  hasPassword?: boolean;
};

export type UpdateRecruiterProfileInput = {
  fullName?: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  wardCode?: string | null;
  addressDetail?: string | null;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export const recruiterAccountApi = {
  getMe: (signal?: AbortSignal) =>
    http<ApiSuccess<RecruiterAccount>>("/users/me", { signal }),

  updateMe: (body: UpdateRecruiterProfileInput) =>
    http<ApiSuccess<RecruiterAccount>>("/users/me", { method: "PATCH", body }),

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

  changePassword: (body: ChangePasswordInput) =>
    http<ApiSuccess<null>>("/users/me/password", { method: "PATCH", body }),
};
