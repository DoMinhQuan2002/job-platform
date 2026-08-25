import { NextFunction, Request, Response } from "express";
import { ROLES } from "../../common/constants/roles";
import { AppError } from "../../common/errors/app-error";
import { companiesService } from "./companies.service";
import { createCompanySchema } from "./dto/create-company.dto";
import { updateCompanySchema } from "./dto/update-company.dto";
import { queryCompaniesSchema } from "./dto/query-companies.dto";

export class CompaniesController {

  /**
   * GET /api/v1/companies — Xem danh sách công ty công khai dành cho Candidate/Public
   */
  getPublicCompanies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = queryCompaniesSchema.safeParse(req.query);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        throw new AppError(
          400,
          "BAD_REQUEST",
          parsed.error.issues[0]?.message || "Tham số truy vấn không hợp lệ",
          errorMessages
        );
      }

      const data = await companiesService.getPublicCompanies(parsed.data);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách công ty thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/companies/me — Xem thông tin công ty của nhà tuyển dụng đang đăng nhập
   */
  getMyCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  };

  /**
   * POST /api/v1/companies — Tạo mới hồ sơ công ty cho nhà tuyển dụng
   */
  createCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  };

  /**
   * PUT /api/v1/companies/me — Cập nhật thông tin chi tiết hồ sơ công ty
   */
  updateMyCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập hoặc token không hợp lệ");
      }

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


