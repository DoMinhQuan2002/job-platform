import { Request, Response } from "express";

export const notFoundMiddleware = (_req: Request, res: Response) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
};
