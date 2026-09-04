import {
  clearAccessToken,
  setAuthPersistence,
  setAccessToken,
  setStoredUser,
} from "@/lib/auth-token";
import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";

export type AuthRole = "CANDIDATE" | "RECRUITER";

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  role: string;
  avatar?: string | null;
};

export type RegisterBody = {
  email: string;
  password: string;
  fullName: string;
  role: AuthRole;
};

export type VerifyCodeBody = {
  email: string;
  code: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

type AuthSession = {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
};

type AccessTokenData = {
  accessToken: string;
  expiresIn: number;
};

const saveSession = (session: AuthSession, remember = false) => {
  setAuthPersistence(remember);
  setAccessToken(session.accessToken);
  setStoredUser(session.user);
};

export const authApi = {
  register: (body: RegisterBody) =>
    http<ApiSuccess<{ email: string; otpExpiresIn: number }>>("/register", {
      method: "POST",
      body,
      skipAuth: true,
    }),

  verifyRegisterCode: (body: VerifyCodeBody) =>
    http<ApiSuccess<{ userId: number; email: string }>>(
      "/register/verify-code",
      {
        method: "POST",
        body,
        skipAuth: true,
      },
    ),

  resendRegisterCode: (body: { email: string }) =>
    http<ApiSuccess<{ otpExpiresIn: number }>>("/register/resend-code", {
      method: "POST",
      body,
      skipAuth: true,
    }),

  login: async (body: LoginBody, options?: { remember?: boolean }) => {
    const response = await http<ApiSuccess<AuthSession>>("/login", {
      method: "POST",
      body,
      skipAuth: true,
    });
    saveSession(response.data, options?.remember);
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
    setAccessToken(response.data.accessToken);
    return response;
  },

  forgotPassword: (body: { email: string }) =>
    http<ApiSuccess<Record<string, never>>>("/forgot-password", {
      method: "POST",
      body,
      skipAuth: true,
    }),

  verifyForgotPasswordCode: (body: VerifyCodeBody) =>
    http<
      ApiSuccess<{ resetToken: string; resetTokenExpiresIn: number }>
    >("/forgot-password/verify-code", {
      method: "POST",
      body,
      skipAuth: true,
    }),

  resetPassword: (body: { resetToken: string; newPassword: string }) =>
    http<ApiSuccess<Record<string, never>>>("/forgot-password/reset", {
      method: "POST",
      body,
      skipAuth: true,
    }),

  resendForgotPasswordCode: (body: { email: string }) =>
    http<ApiSuccess<Record<string, never>>>(
      "/forgot-password/resend-code",
      {
        method: "POST",
        body,
        skipAuth: true,
      },
    ),

  loginWithGoogle: async (body: { idToken: string; role?: AuthRole }) => {
    const response = await http<ApiSuccess<AuthSession>>("/oauth/google", {
      method: "POST",
      body,
      skipAuth: true,
    });
    saveSession(response.data);
    return response;
  },

  health: () =>
    http<ApiSuccess<{ service: string }>>("/auth/health", {
      skipAuth: true,
    }),
};
