export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details ?? null;
  }
}

type AppErrorBody = {
  success?: boolean;
  code?: string;
  message?: string;
  details?: unknown;
  errors?: unknown;
};

const isAppErrorBody = (value: unknown): value is AppErrorBody => {
  return typeof value === "object" && value !== null;
};

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(0, "CLIENT_ERROR", error.message);
  }

  return new ApiError(0, "UNKNOWN_ERROR", "Something went wrong");
};

export const toApiErrorFromResponse = async (response: Response): Promise<ApiError> => {
  try {
    const body: unknown = await response.json();

    if (isAppErrorBody(body) && (body.code || body.message || body.errors)) {
      return new ApiError(
        response.status,
        body.code || "UNKNOWN_ERROR",
        body.message || response.statusText,
        body.details ?? body.errors ?? null,
      );
    }
  } catch {
    // ignore JSON parse errors
  }

  return new ApiError(
    response.status,
    "UNKNOWN_ERROR",
    response.statusText || "Request failed",
  );
};
