import { NextFunction, Request, Response } from "express";
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

export const applicationsController = new ApplicationsController();
