import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Unhandled error:", error);

  res.status(500).json({
    message: "Internal server error. Please try again later.",
  });
};
