import { NextFunction, Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { companiesService } from "./companies.service";
import { createCompanySchema } from "./dto/create-company.dto";

export class CompaniesController {
  /**
   * GET /api/v1/companies/me — Xem thông tin công ty của nhà tuyển dụng đang đăng nhập
   */
  async getMyCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ");
      }

      const data = await companiesService.getMyCompany(userId);

      res.status(200).json({
        success: true,
        message: "Lấy thông tin công ty thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/companies — Tạo mới hồ sơ công ty cho nhà tuyển dụng
   */
  async createCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ");
      }

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
  }
}

export const companiesController = new CompaniesController();
