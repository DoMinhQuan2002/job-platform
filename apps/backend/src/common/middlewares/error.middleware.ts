import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      details: error.details ?? null,
    });
    return;
  }

  console.error("Unhandled error:", error);

  res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error. Please try again later.",
  });
};
