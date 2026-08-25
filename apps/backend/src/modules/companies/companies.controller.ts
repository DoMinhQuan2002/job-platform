import { NextFunction, Request, Response } from "express";
import { ROLES } from "../../common/constants/roles";
import { AppError } from "../../common/errors/app-error";
import { companiesService } from "./companies.service";
import { createCompanySchema } from "./dto/create-company.dto";
import { updateCompanySchema } from "./dto/update-company.dto";

export class CompaniesController {
  private ensureRecruiter = (req: Request): string => {
    const user = req.user;
    if (!user?.id) {
      throw new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ");
    }
    if (user.role !== ROLES.RECRUITER) {
      throw new AppError(403, "FORBIDDEN", "Chỉ tài khoản RECRUITER mới có quyền thực hiện thao tác này");
    }
    return user.id;
  };

  /**
   * GET /api/v1/companies/me — Xem thông tin công ty của nhà tuyển dụng đang đăng nhập
   */
  getMyCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.ensureRecruiter(req);
      const data = await companiesService.getMyCompany(userId);

      res.status(200).json({
        success: true,
        message: "Lấy thông tin công ty thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/companies — Tạo mới hồ sơ công ty cho nhà tuyển dụng
   */
  createCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.ensureRecruiter(req);

      const parsed = createCompanySchema.safeParse(req.body);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        throw new AppError(
          400,
          "BAD_REQUEST",
          parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ",
          errorMessages
        );
      }

      const data = await companiesService.createCompany(userId, parsed.data);

      res.status(201).json({
        success: true,
        message: "Khởi tạo hồ sơ công ty thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/companies/me — Cập nhật thông tin chi tiết hồ sơ công ty
   */
  updateMyCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.ensureRecruiter(req);

      const parsed = updateCompanySchema.safeParse(req.body);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        throw new AppError(
          400,
          "BAD_REQUEST",
          parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ",
          errorMessages
        );
      }

      const data = await companiesService.updateMyCompany(userId, parsed.data);

      res.status(200).json({
        success: true,
        message: "Cập nhật thông tin công ty thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const companiesController = new CompaniesController();

