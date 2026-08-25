import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next(new AppError(404, "NOT_FOUND", `Không tìm thấy endpoint: ${req.originalUrl}`));
};
