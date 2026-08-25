import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { getPermissionsForRole } from "../security/permissions";

/**
 * Phan quyen theo bang role_permissions - dung SAU authenticate.
 * Vi du: authRouter.get("/users", authenticate, authorize("user:read"), handler)
 *
 * Truyen nhieu permission thi request phai co DU tat ca.
 */
export const authorize = (...required: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // Quen gan authenticate phia truoc -> bao 401 thay vi im lang cho qua.
    if (!req.user) {
      next(new AppError(401, "UNAUTHORIZED", "Access token không hợp lệ hoặc đã hết hạn"));
      return;
    }

    try {
      const granted = await getPermissionsForRole(req.user.role);

      if (!required.every((permission) => granted.includes(permission))) {
        next(new AppError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này"));
        return;
      }

      // Cache lai tren request de controller khoi phai query lan nua.
      req.user.permissions = granted;
      next();
    } catch (error) {
      next(error);
    }
  };
};
