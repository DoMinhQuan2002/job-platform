import { ApiError, toApiError, toApiErrorFromResponse } from "@/lib/api-error";
import {
  getAccessToken,
  isTokenExpired,
  logoutAndRedirectToLogin,
  setAccessToken,
} from "@/lib/auth-token";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
).replace(/\/$/, "");
const API_PREFIX = "/api/v1";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type HttpOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  absolute?: boolean;
  signal?: AbortSignal;
  _isRetry?: boolean;
};

const resolveUrl = (path: string, absolute?: boolean) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (absolute || path.startsWith("/api/")) {
    return `${API_ORIGIN}${path}`;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${API_PREFIX}${normalized}`;
};

/**
 * Promise Mutex Queue: Đảm bảo khi nhiều request đồng thời phát hiện token hết hạn,
 * chỉ có DUY NHẤT 1 request refresh token được gửi đi.
 */
let refreshPromise: Promise<string | null> | null = null;

export const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_ORIGIN}${API_PREFIX}/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setAccessToken(null);
        return null;
      }

      const json = await res.json();
      if (json?.success && json?.data?.accessToken) {
        const newToken = json.data.accessToken as string;
        setAccessToken(newToken);
        return newToken;
      }

      setAccessToken(null);
      return null;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const http = async <T>(
  path: string,
  options: HttpOptions = {}
): Promise<T> => {
  try {
    const headers: Record<string, string> = { ...options.headers };
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    if (!isFormData && options.body !== undefined && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    // 1. Kiểm tra và làm mới token trước khi gửi nếu cần
    if (!options.skipAuth) {
      let token = getAccessToken();
      const isLogoutRequest = path === "/logout" || path.endsWith("/logout");
      if (!token || isTokenExpired(token)) {
        if (!isLogoutRequest) {
          token = await refreshAccessToken();
          if (!token) {
            logoutAndRedirectToLogin("session_expired");
            throw new ApiError(
              401,
              "Phiên đăng nhập đã hết hạn. Đang chuyển hướng...",
              "TOKEN_EXPIRED"
            );
          }
        }
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(resolveUrl(path, options.absolute), {
      method: options.method || "GET",
      headers,
      credentials: "include",
      signal: options.signal,
      body:
        options.body === undefined
          ? undefined
          : isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body),
    });

    // 2. Xử lý khi server phản hồi mã 401 Unauthorized
    if (response.status === 401 && !options.skipAuth && !options._isRetry) {
      const isLogoutRequest = path === "/logout" || path.endsWith("/logout");
      if (isLogoutRequest) {
        return undefined as T;
      }

      const newToken = await refreshAccessToken();
      if (newToken) {
        // Tự động retry lại request ban đầu với accessToken mới
        return http<T>(path, {
          ...options,
          _isRetry: true,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      }

      logoutAndRedirectToLogin("session_expired");
      throw await toApiErrorFromResponse(response);
    }

    if (!response.ok) {
      throw await toApiErrorFromResponse(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    throw toApiError(error);
  }
};

export { ApiError, toApiError, API_ORIGIN, API_PREFIX };
