import { NextFunction, Request, Response } from "express";
<<<<<<< HEAD
import { applicationsService } from "./applications.service";
import { candidateProfilesService } from "../candidate-profiles/candidate-profiles.service";
import { ApplicationStatus, ROLES } from "../../common/constants";

export class ApplicationsController {
  // TODO: POST / — Ứng viên nộp đơn
  // Body: { jobId, resumeId }
  // Validate: ownership CV, job status, duplicate
  
  async apply (_req: Request, res: Response, next: NextFunction) {
    try {
      const userId = _req.user?.id as string;
      const candidateProfile = await candidateProfilesService.getMyProfile(userId);
      const _data: {
        jobId: string;
        resumeId: string;
      } = _req.body;
      const result = await applicationsService.apply(candidateProfile.id, _data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // TODO: GET /me — Lịch sử ứng tuyển (kèm thông tin job từ Nhóm 2)
  async getMyApplications (_req: Request, res: Response, next: NextFunction) {
    try {
      const userId = _req.user?.id as string;
      const candidateProfile = await candidateProfilesService.getMyProfile(userId);
      
      const result = await applicationsService.getMyApplications(candidateProfile.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // TODO: GET /me/:id — Chi tiết một đơn ứng tuyển
  async getMyApplicationById (_req: Request, res: Response, next: NextFunction) {
    try {
      const application_id = _req.params.id as string;

      const userId = _req.user?.id as string;
      const candidateProfile = await candidateProfilesService.getMyProfile(userId);

      const result = await applicationsService.getMyApplicationById(application_id, candidateProfile.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // TODO: DELETE /me/:id — Rút đơn (chỉ khi status = APPLIED)
  // @RoleGuard(ROLES.CANDIDATE)
  async withdraw (_req: Request, res: Response, next: NextFunction) {
    try {
      const application_id = _req.params.id as string;
      const candidateId = _req.user?.id as string;
      const candidateProfile = await candidateProfilesService.getMyProfile(candidateId);
      const result = await applicationsService.withdraw(application_id, candidateProfile.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // TODO: PATCH /:id/status — Nhà tuyển dụng cập nhật trạng thái (RECRUITER only)
  // Validate: Recruiter phải là chủ của Job đó
  // State machine: APPLIED → REVIEWED → INTERVIEWING → ACCEPTED | REJECTED

  // @RoleGuard(ROLES.RECRUITER)
  async updateStatus (_req: Request, res: Response, next: NextFunction) {
    try {
      const application_id = _req.params.id as string;
      const recruiterUserId = _req.user?.id as string;
      const newStatus = _req.body.status as ApplicationStatus;
      const result = await applicationsService.updateStatus(application_id, recruiterUserId, newStatus);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }


  // @RoleGuard(ROLES.RECRUITER)
  async getApplicationsByJobId (_req: Request, res: Response, next: NextFunction) {
    try {
      const job_id = _req.params.id as string;
      const recruiterUserId = _req.user?.id as string;
      const result = await applicationsService.getApplicationsByJobId(job_id, recruiterUserId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};

=======
import { AppError } from "../../common/errors/app-error";
import { applicationsService } from "./applications.service";
import { ApplicationStatus } from "../../common/constants";

export const getAuthUser = (req: Request) => {
  if (!req.user?.id) {
    throw new AppError(401, "UNAUTHORIZED", "Vui lòng đăng nhập để tiếp tục");
  }
  return req.user;
};

export const requireCandidate = (req: Request) => {
  const user = getAuthUser(req);
  if (user.role !== "CANDIDATE") {
    throw new AppError(403, "FORBIDDEN", "Chỉ ứng viên mới có quyền thực hiện thao tác này");
  }
  return user;
};

export const requireRecruiter = (req: Request) => {
  const user = getAuthUser(req);
  if (user.role !== "RECRUITER") {
    throw new AppError(403, "FORBIDDEN", "Chỉ nhà tuyển dụng mới có quyền thực hiện thao tác này");
  }
  return user;
};

const getParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param ?? "";
};

export class ApplicationsController {
  /** POST /api/v1/jobs/:jobId/apply */
  apply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCandidate(req);
      const jobId = getParam(req.params.jobId);
      const { resumeId } = req.body || {};

      const data = await applicationsService.apply(user.id, jobId, { resumeId });
      res.status(201).json({
        success: true,
        message: "Ứng tuyển thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/v1/applications */
  listApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = getAuthUser(req);
      if (user.role !== "CANDIDATE" && user.role !== "RECRUITER" && user.role !== "ADMIN") {
        throw new AppError(403, "FORBIDDEN", "Không có quyền truy cập");
      }

      const status = req.query.status as ApplicationStatus | undefined;
      const jobId = req.query.jobId ? String(req.query.jobId) : undefined;
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;

      const data = await applicationsService.listApplications(user, {
        status,
        jobId,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        message: "Thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/v1/applications/:id */
  getApplicationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = getAuthUser(req);
      const id = getParam(req.params.id);

      const data = await applicationsService.getApplicationById(user, id);
      res.status(200).json({
        success: true,
        message: "Thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /** PUT /api/v1/applications/:id/status */
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireRecruiter(req);
      const id = getParam(req.params.id);
      const { status } = req.body || {};

      const data = await applicationsService.updateStatus(user, id, { status });
      res.status(200).json({
        success: true,
        message: "Thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /** POST /api/v1/applications/:id/withdraw */
  withdraw = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCandidate(req);
      const id = getParam(req.params.id);

      const data = await applicationsService.withdraw(user.id, id);
      res.status(200).json({
        success: true,
        message: "Thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /** POST /api/v1/jobs/:jobId/save */
  saveJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCandidate(req);
      const jobId = getParam(req.params.jobId);

      const result = await applicationsService.saveJob(user.id, jobId);
      const statusCode = result.isNew ? 201 : 200;

      res.status(statusCode).json({
        success: true,
        message: "Thành công",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };

  /** DELETE /api/v1/jobs/:jobId/save */
  unsaveJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCandidate(req);
      const jobId = getParam(req.params.jobId);

      await applicationsService.unsaveJob(user.id, jobId);
      res.status(200).json({
        success: true,
        message: "Thành công",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/v1/saved-jobs */
  listSavedJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCandidate(req);
      const data = await applicationsService.listSavedJobs(user.id);

      res.status(200).json({
        success: true,
        message: "Thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

>>>>>>> 0d751e5 (Lưu tạm code phần Application & Saved Jobs để pull main)
export const applicationsController = new ApplicationsController();
