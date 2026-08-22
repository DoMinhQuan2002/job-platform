import { ApiError, toApiError, toApiErrorFromResponse } from "@/lib/api-error";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type HttpOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
};

export const http = async <T>(path: string, options: HttpOptions = {}): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
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

export { ApiError, toApiError };
