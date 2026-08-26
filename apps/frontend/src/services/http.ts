import { ApiError, toApiError, toApiErrorFromResponse } from "@/lib/api-error";
import { getAccessToken } from "@/lib/auth-token";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000").replace(
  /\/$/,
  "",
);
const API_PREFIX = "/api/v1";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type HttpOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** Bỏ Authorization (vd. login/register) */
  skipAuth?: boolean;
  /** Absolute path bắt đầu bằng /api/... — mặc định tự nối /api/v1 */
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
