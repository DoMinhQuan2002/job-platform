import type { Response } from "express";

/**
 * Envelope chung cho toan bo API (xem docs/api-contract/README.md):
 * { success, message, data } cho thanh cong, { success, message, errors } cho loi.
 */
export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T = {} as T,
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
