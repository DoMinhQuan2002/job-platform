import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

/**
 * Validate req.body va thay bang gia tri da parse.
 * ZodError duoc errorMiddleware bat va tra ve 400 theo envelope chung.
 */
export const validateBody =
  (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      next(result.error);
      return;
    }

    req.body = result.data;
    next();
  };
