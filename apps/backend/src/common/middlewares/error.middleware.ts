import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof AppError) {
    // `code` luon co mat trong errors[] de FE bat duoc cac case nhu EMAIL_NOT_VERIFIED.
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: [
        error.details === undefined
          ? { code: error.code }
          : { code: error.code, details: error.details },
      ],
    });
    return;
  }

  console.error("Unhandled error:", error);

  res.status(500).json({
    success: false,
    message: "Lỗi hệ thống, vui lòng thử lại sau",
    errors: [{ code: "INTERNAL_SERVER_ERROR" }],
  });
};
