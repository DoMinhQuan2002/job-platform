import { http } from "./http";

export interface CurrentUser {
  id: string | number;
  roleId?: string | number;
  role?: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatar?: string | null;
}

export interface CurrentUserResponse {
  success: boolean;
  message: string;
  data: CurrentUser;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    expiresIn?: number;
    user: CurrentUser;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    expiresIn: number;
  };
}

export const authApi = {
  getMe: async () => {
    return http<CurrentUserResponse>("/users/me");
  },

  login: async (input: { email: string; password: string }) => {
    return http<LoginResponse>("/login", {
      method: "POST",
      body: input,
      skipAuth: true,
    });
  },

  refresh: async () => {
    return http<RefreshTokenResponse>("/refresh-token", {
      method: "POST",
      skipAuth: true,
    });
  },

  logout: async () => {
    return http<{ success: boolean; message: string }>("/logout", {
      method: "POST",
    });
  },
};
