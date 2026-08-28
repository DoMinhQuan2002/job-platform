import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import {
  applicationsByStatusQuerySchema,
  candidateTrendQuerySchema,
  recentJobsQuerySchema,
  statisticsTimeQuerySchema,
} from "./recruiter-statistics.dto";
import { recruiterStatisticsService } from "./recruiter-statistics.service";

const requireUserId = (req: Request): string => {
  if (!req.user?.id) {
    throw new AppError(401, "UNAUTHORIZED", "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.");
  }
  return req.user.id;
};

export const recruiterStatisticsController = {
  /**
   * GET /recruiter/statistics/overview
   */
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = requireUserId(req);
      const parsed = statisticsTimeQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        throw new AppError(
          400,
          "BAD_REQUEST",
          parsed.error.issues[0]?.message || "Tham số thời gian không hợp lệ",
          errorMessages,
        );
      }

      const data = await recruiterStatisticsService.getOverview(userId, parsed.data);

      res.status(200).json({
        success: true,
        message: "Lấy thống kê tổng quan thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /recruiter/statistics/applications-by-status
   */
  async getApplicationsByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = requireUserId(req);
      const parsed = applicationsByStatusQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        throw new AppError(
          400,
          "BAD_REQUEST",
          parsed.error.issues[0]?.message || "Tham số truy vấn không hợp lệ",
          errorMessages,
        );
      }

      const data = await recruiterStatisticsService.getApplicationsByStatus(userId, parsed.data);

      res.status(200).json({
        success: true,
        message: "Lấy thống kê trạng thái ứng viên thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /recruiter/statistics/recent-jobs
   */
  async getRecentJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = requireUserId(req);
      const parsed = recentJobsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        throw new AppError(
          400,
          "BAD_REQUEST",
          parsed.error.issues[0]?.message || "Tham số truy vấn không hợp lệ",
          errorMessages,
        );
      }

      const data = await recruiterStatisticsService.getRecentJobs(userId, parsed.data);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách tin tuyển dụng gần đây thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /recruiter/statistics/candidate-trend
   */
  async getCandidateTrend(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = requireUserId(req);
      const parsed = candidateTrendQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        throw new AppError(
          400,
          "BAD_REQUEST",
          parsed.error.issues[0]?.message || "Tham số truy vấn biểu đồ không hợp lệ",
          errorMessages,
        );
      }

      const data = await recruiterStatisticsService.getCandidateTrend(userId, parsed.data);

      res.status(200).json({
        success: true,
        message: "Lấy biểu đồ xu hướng ứng viên thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
