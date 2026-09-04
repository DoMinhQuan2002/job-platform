import {
  clearAccessToken,
  setAuthPersistence,
  setAccessToken,
  setStoredUser,
} from "@/lib/auth-token";
import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";

export type AuthUser = {
  id: number | string;
  email: string;
  fullName: string;
  role?: string;
  avatar?: string | null;
  phone?: string | null;
};

export type CurrentUser = AuthUser;

export interface CurrentUserResponse {
  success: boolean;
  message: string;
  data: CurrentUser;
}

export type LoginBody = {
  email: string;
  password: string;
};

export type AuthSession = {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
};

export type AccessTokenData = {
  accessToken: string;
  expiresIn: number;
};

const saveSession = (session: AuthSession, remember = false) => {
  setAuthPersistence(remember);
  setAccessToken(session.accessToken);
  setStoredUser(session.user);
};

export const authApi = {
  getMe: async () => {
    return http<CurrentUserResponse>("/users/me");
  },

  login: async (body: LoginBody, options?: { remember?: boolean }) => {
    const response = await http<ApiSuccess<AuthSession>>("/login", {
      method: "POST",
      body,
      skipAuth: true,
    });
    if (response && response.data) {
      saveSession(response.data, options?.remember);
    }
    return response;
  },

  logout: async () => {
    try {
      return await http<ApiSuccess<Record<string, never>>>("/logout", {
        method: "POST",
      });
    } finally {
      clearAccessToken();
    }
  },

  refresh: async () => {
    const response = await http<ApiSuccess<AccessTokenData>>("/refresh-token", {
      method: "POST",
      skipAuth: true,
    });
    if (response && response.data) {
      setAccessToken(response.data.accessToken);
    }
    return response;
  },
};
