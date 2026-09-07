import { ApiError, toApiError, toApiErrorFromResponse } from "@/lib/api-error";
import {
  clearAccessToken,
  getAccessToken,
  isTokenExpired,
  logoutAndRedirectToLogin,
  setAccessToken,
} from "@/lib/auth-token";

const rawBase = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
).trim().replace(/\/+$/, "");

const API_ORIGIN = rawBase.endsWith("/api/v1")
  ? rawBase.slice(0, -7)
  : rawBase.endsWith("/api")
  ? rawBase.slice(0, -4)
  : rawBase;

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

const sendRequest = (
  url: string,
  options: HttpOptions,
  headers: Record<string, string>
) =>
  fetch(url, {
    method: options.method || "GET",
    headers,
    credentials: "include",
    signal: options.signal,
    body:
      options.body === undefined
        ? undefined
        : typeof FormData !== "undefined" && options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body),
  });

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

    if (!options.skipAuth) {
      let token = getAccessToken();
      if (!token || isTokenExpired(token)) {
        token = await refreshAccessToken();
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const url = resolveUrl(path, options.absolute);
    let response = await sendRequest(url, options, headers);

    if (response.status === 401 && !options.skipAuth && !options._isRetry) {
      const isLogoutRequest = path === "/logout" || path.endsWith("/logout");
      if (isLogoutRequest) {
        clearAccessToken();
        return undefined as T;
      }

      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          headers.Authorization = `Bearer ${newToken}`;
          response = await sendRequest(url, { ...options, _isRetry: true }, headers);
        }
      } catch {
        clearAccessToken();
      }

      if (response.status === 401) {
        logoutAndRedirectToLogin("session_expired");
        throw await toApiErrorFromResponse(response);
      }
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
