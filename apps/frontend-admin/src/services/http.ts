import { ApiError, toApiError, toApiErrorFromResponse } from "@/lib/api-error";
import { clearAccessToken, getAccessToken } from "@/lib/auth-token";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000").replace(
  /\/$/,
  "",
);
const API_PREFIX = "/api/v1";

let refreshPromise: Promise<string> | null = null;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type HttpOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  absolute?: boolean;
  signal?: AbortSignal;
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

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = import("@/services/auth.service")
      .then(({ authApi }) => authApi.refresh())
      .then((response) => response.data.accessToken)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const sendRequest = (url: string, options: HttpOptions, headers: Record<string, string>) =>
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

export const http = async <T>(path: string, options: HttpOptions = {}): Promise<T> => {
  try {
    const headers: Record<string, string> = { ...options.headers };
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

    if (!isFormData && options.body !== undefined && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (!options.skipAuth) {
      const token = getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const url = resolveUrl(path, options.absolute);
    let response = await sendRequest(url, options, headers);

    if (response.status === 401 && !options.skipAuth) {
      try {
        const accessToken = await refreshAccessToken();
        headers.Authorization = `Bearer ${accessToken}`;
        response = await sendRequest(url, options, headers);

        if (response.status === 401) {
          clearAccessToken();
        }
      } catch {
        clearAccessToken();
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

