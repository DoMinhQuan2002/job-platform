import { http } from "./http";

export interface AccountUser {
  id: number | string;
  email: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  dateOfBirth: string | null;
  addressDetail: string | null;
  wardCode: string | null;
  hasPassword?: boolean;
}

export interface AccountUserResponse {
  success: boolean;
  message: string;
  data: AccountUser;
}

export interface UpdateAccountInput {
  fullName?: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  addressDetail?: string | null;
  wardCode?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const adminAccountApi = {
  getMe: () => http<AccountUserResponse>("/users/me"),

  updateMe: (body: UpdateAccountInput) =>
    http<AccountUserResponse>("/users/me", { method: "PATCH", body }),

  uploadAvatar: (file: File) => {
    const body = new FormData();
    body.append("avatar", file);
    return http<{ success: boolean; message: string; data: { avatar: string } }>(
      "/users/me/avatar",
      { method: "POST", body },
    );
  },

  deleteAvatar: () =>
    http<{ success: boolean; message: string; data: { avatar: null } }>(
      "/users/me/avatar",
      { method: "DELETE" },
    ),

  changePassword: (body: ChangePasswordInput) =>
    http<{ success: boolean; message: string; data: null }>("/users/me/password", {
      method: "PATCH",
      body,
    }),
};
