import { ApplicationStatus } from "../../common/constants";
import { ROLES } from "../../common/constants/roles";
import { AppError } from "../../common/errors/app-error";
import { AppDataSource } from "../../data-source";
import { ApplicationEntity } from "../../database/entities/application.entity";
import { ResumeEntity } from "../../database/entities/resume.entity";
import { Job } from "../../database/entities/job.entity";
import { JOB_STATUS } from "../../common/constants/job";


export class ApplicationsService {
  private appRepo = AppDataSource.getRepository(ApplicationEntity);

  // ──────────────────────────────────────────────────────────────
  // NỘP ĐƠN ỨNG TUYỂN
  // ──────────────────────────────────────────────────────────────
  async apply(candidateId: string, data: { jobId: string; resumeId: string }) {
    try {
      // Validate 1: Ownership CV
      const resumeRepo = AppDataSource.getRepository(ResumeEntity);
      const resume = await resumeRepo.findOne({ where: { id: data.resumeId, candidateId } });
      if (!resume) throw new AppError(403, "FORBIDDEN", "CV không phải là của bạn");

      // Validate 2: Cross-Group (Job status)
      const jobRepo = AppDataSource.getRepository(Job);
      const job = await jobRepo.findOne({ where: { id: data.jobId, status: JOB_STATUS.APPROVED } });
      if (!job) throw new AppError(400, "BUSINESS_RULE_VIOLATION", "Job is not available");

      // Validate 3: Duplicate application
      const existing = await this.appRepo.findOne({ where: { candidateId, jobId: data.jobId } });
      if (existing) throw new AppError(409, "CONFLICT", "Already applied to this job");

      const application = this.appRepo.create({
        candidateId,
        jobId: data.jobId,
        resumeId: data.resumeId,
        resumeSnapshotUrl: resume.fileUrl,
        status: ApplicationStatus.APPLIED,
      });
      return await this.appRepo.save(application);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, "DB_ERROR", "Lỗi không thể nộp đơn", error);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // LỊCH SỬ ỨNG TUYỂN CỦA ỨNG VIÊN
  // ──────────────────────────────────────────────────────────────
  async getMyApplications(candidateId: string) {
    try {
      return await this.appRepo.find({
        where: { candidateId },
        relations: ["job", "job.company"],
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, "DB_ERROR", "Lỗi khi lấy danh sách ứng tuyển", error);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // CHI TIẾT MỘT ĐƠN ỨNG TUYỂN
  // ──────────────────────────────────────────────────────────────
  async getMyApplicationById(id: string, candidateId: string) {
    try {
      const application = await this.appRepo.findOne({
        where: { id, candidateId },
        relations: ["job", "job.company"],
      });
      if (!application) {
        throw new AppError(404, "NOT_FOUND", "Không tìm thấy đơn ứng tuyển");
      }
      return application;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, "DB_ERROR", "Lỗi khi lấy chi tiết đơn ứng tuyển", error);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // RÚT ĐƠN ỨNG TUYỂN (chỉ khi status = APPLIED)
  // ──────────────────────────────────────────────────────────────
  async withdraw(id: string, candidateId: string) {
    try {
      const application = await this.getMyApplicationById(id, candidateId);

      if (application.status !== ApplicationStatus.APPLIED) {
        throw new AppError(
          400,
          "BUSINESS_RULE_VIOLATION",
          `Không thể rút đơn khi trạng thái là "${application.status}"`,
        );
      }

      application.status = ApplicationStatus.WITHDRAWN;
      return await this.appRepo.save(application);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, "DB_ERROR", "Lỗi khi rút đơn ứng tuyển", error);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // NHÀ TUYỂN DỤNG CẬP NHẬT TRẠNG THÁI
  // ──────────────────────────────────────────────────────────────

  async updateStatus(id: string, recruiterUserId: string, newStatus: ApplicationStatus) {
    try {
      // Bước 1: Tìm đơn ứng tuyển kèm thông tin job và company
      const application = await this.appRepo.findOne({
        where: { id },
        relations: ["job", "job.company"],
      });
      if (!application) {
        throw new AppError(404, "NOT_FOUND", "Không tìm thấy đơn ứng tuyển");
      }

      // Bước 2: Kiểm tra recruiter có phải chủ của Job này không (Cross-Group)
      if (application.job.company.userId !== recruiterUserId) {
        throw new AppError(403, "FORBIDDEN", "Bạn không có quyền cập nhật trạng thái đơn này");
      }

      // Bước 3: Validate newStatus có phải là giá trị hợp lệ trong enum không
      const validStatuses = Object.values(ApplicationStatus) as string[];
      if (!validStatuses.includes(newStatus)) {
        throw new AppError(400, "VALIDATION_ERROR", `Trạng thái "${newStatus}" không hợp lệ`);
      }

      // Bước 4: Lưu trạng thái mới
      application.status = newStatus as ApplicationStatus;
      return await this.appRepo.save(application);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, "DB_ERROR", "Lỗi khi cập nhật trạng thái", error);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // RECRUITER XEM DANH SÁCH ĐƠN CỦA MỘT JOB
  // ──────────────────────────────────────────────────────────────
  async getApplicationsByJobId(jobId: string, recruiterUserId: string) {
    try {
      // Validate 1: Kiểm tra Job có tồn tại và recruiter phải là chủ Job
      const jobRepo = AppDataSource.getRepository(Job);
      const job = await jobRepo.findOne({
        where: { id: jobId },
        relations: ["company"],
      });

      if (!job) {
        throw new AppError(404, "NOT_FOUND", "Không tìm thấy Job");
      }

      if (job.company.userId !== recruiterUserId) {
        throw new AppError(403, "FORBIDDEN", "Bạn không có quyền xem danh sách ứng tuyển của Job này");
      }

      // Lấy danh sách kèm theo thông tin resume và ứng viên
      return await this.appRepo.find({
        where: { jobId },
        relations: ["resume", "candidate"],
        order: {
          appliedAt: "DESC",
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, "DB_ERROR", "Lỗi khi lấy danh sách đơn ứng tuyển của Job", error);
    }
  }


  

}

export const applicationsService = new ApplicationsService();
