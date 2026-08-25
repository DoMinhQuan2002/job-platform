import { setAccessToken, clearAccessToken } from "@/lib/auth-token";
import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";

type AuthTokens = {
  accessToken: string;
  user?: unknown;
};

/** Owner FE: Nhóm 1 — G3 chỉ dùng để login trước khi gọi API candidate */
export const authApi = {
  register: (body: {
    email: string;
    password: string;
    fullName: string;
    role: "CANDIDATE" | "RECRUITER";
  }) => http<ApiSuccess<{ email: string; otpExpiresIn: number }>>("/register", {
    method: "POST",
    body,
    skipAuth: true,
  }),

  verifyRegisterCode: (body: { email: string; code: string }) =>
    http<ApiSuccess<unknown>>("/register/verify-code", {
      method: "POST",
      body,
      skipAuth: true,
    }),

  login: async (body: { email: string; password: string }) => {
    const res = await http<ApiSuccess<AuthTokens>>("/login", {
      method: "POST",
      body,
      skipAuth: true,
    });
    if (res.data?.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    return res;
  },

  logout: async () => {
    try {
      await http<ApiSuccess<null>>("/logout", { method: "POST" });
    } finally {
      clearAccessToken();
    }
  },

  refresh: async () => {
    const res = await http<ApiSuccess<AuthTokens>>("/refresh", {
      method: "POST",
      skipAuth: true,
    });
    if (res.data?.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    return res;
  },
};
