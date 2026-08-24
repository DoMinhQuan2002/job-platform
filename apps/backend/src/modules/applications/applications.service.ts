<<<<<<< HEAD
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


  

=======
import { AppDataSource } from "../../data-source";
import { ApplicationEntity } from "../../database/entities/application.entity";
import { SavedJobEntity } from "../../database/entities/saved-job.entity";
import { CandidateProfileEntity } from "../../database/entities/candidate-profile.entity";
import { ResumeEntity } from "../../database/entities/resume.entity";
import { Job } from "../../database/entities/job.entity";
import { Company } from "../../database/entities/company.entity";
import { UserEntity } from "../../database/entities/user.entity";
import { ApplicationStatus } from "../../common/constants";
import { JOB_STATUS } from "../../common/constants/job";
import { AppError } from "../../common/errors/app-error";
import { notificationService } from "../notifications/notification.service";
import {
  ALLOWED_STATUS_TRANSITIONS,
  ApplicationQueryDto,
  ApplyJobDto,
  UpdateApplicationStatusDto,
} from "./applications.types";

export class ApplicationsService {
  private get applicationRepo() {
    return AppDataSource.getRepository(ApplicationEntity);
  }

  private get savedJobRepo() {
    return AppDataSource.getRepository(SavedJobEntity);
  }

  private get candidateProfileRepo() {
    return AppDataSource.getRepository(CandidateProfileEntity);
  }

  private get resumeRepo() {
    return AppDataSource.getRepository(ResumeEntity);
  }

  private get jobRepo() {
    return AppDataSource.getRepository(Job);
  }

  private get companyRepo() {
    return AppDataSource.getRepository(Company);
  }

  private get userRepo() {
    return AppDataSource.getRepository(UserEntity);
  }

  private async getCandidateProfileByUserId(
    userId: string,
  ): Promise<CandidateProfileEntity> {
    const candidate = await this.candidateProfileRepo.findOne({
      where: { userId },
    });
    if (!candidate) {
      throw new AppError(
        404,
        "CANDIDATE_PROFILE_NOT_FOUND",
        "Không tìm thấy hồ sơ ứng viên",
      );
    }
    return candidate;
  }

  private async getCompanyByUserId(userId: string): Promise<Company | null> {
    return this.companyRepo.findOne({
      where: { userId },
    });
  }

  /**
   * 1. Apply to job
   */
  async apply(
    userId: string,
    jobId: string,
    dto: ApplyJobDto = {},
  ): Promise<ApplicationEntity> {
    const candidate = await this.getCandidateProfileByUserId(userId);

    const job = await this.jobRepo.findOne({
      where: { id: jobId },
    });
    if (!job) {
      throw new AppError(404, "JOB_NOT_FOUND", "Công việc không tồn tại");
    }
    if (job.status !== JOB_STATUS.APPROVED) {
      throw new AppError(
        400,
        "JOB_CLOSED",
        "Công việc không còn nhận hồ sơ ứng tuyển",
      );
    }

    let resume: ResumeEntity | null = null;
    if (dto.resumeId) {
      resume = await this.resumeRepo.findOne({
        where: { id: String(dto.resumeId), candidateId: candidate.id },
      });
      if (!resume) {
        throw new AppError(
          404,
          "RESUME_NOT_FOUND",
          "CV không tồn tại hoặc không thuộc quyền sở hữu",
        );
      }
    } else {
      resume = await this.resumeRepo.findOne({
        where: { candidateId: candidate.id, isDefault: true },
      });
      if (!resume) {
        throw new AppError(
          400,
          "RESUME_REQUIRED",
          "Vui lòng chọn CV để ứng tuyển hoặc đặt một CV làm mặc định",
        );
      }
    }

    const existingApplication = await this.applicationRepo.findOne({
      where: {
        candidateId: candidate.id,
        jobId,
      },
    });
    if (existingApplication) {
      throw new AppError(
        409,
        "APPLICATION_ALREADY_EXISTS",
        "Bạn đã ứng tuyển công việc này rồi",
      );
    }

    try {
      const application = this.applicationRepo.create({
        candidateId: candidate.id,
        jobId,
        resumeId: resume.id,
        resumeSnapshotUrl: resume.fileUrl,
        status: ApplicationStatus.APPLIED,
        appliedAt: new Date(),
      });

      const saved = await this.applicationRepo.save(application);

      // Gửi thông báo tới nhà tuyển dụng sở hữu tin
      try {
        const company = await this.companyRepo.findOne({
          where: { id: job.companyId },
        });
        if (company?.userId) {
          const user = await this.userRepo.findOne({
            where: { id: userId },
          });
          await notificationService.create({
            userId: company.userId,
            type: "NEW_APPLICATION",
            target: { type: "APPLICATION", id: saved.id },
            params: {
              candidateName: user?.fullName || "Ứng viên",
              jobTitle: job.title,
            },
          });
        }
      } catch (notifErr) {
        console.error("Failed to send notification for NEW_APPLICATION:", notifErr);
      }

      return saved;
    } catch (err: any) {
      if (err?.code === "23505") {
        throw new AppError(
          409,
          "APPLICATION_ALREADY_EXISTS",
          "Bạn đã ứng tuyển công việc này rồi",
        );
      }
      throw err;
    }
  }

  /**
   * 2. List applications
   */
  async listApplications(
    user: { id: string; role: "CANDIDATE" | "RECRUITER" | "ADMIN" },
    query: ApplicationQueryDto = {},
  ): Promise<ApplicationEntity[]> {
    if (
      query.status &&
      !Object.values(ApplicationStatus).includes(query.status)
    ) {
      throw new AppError(400, "INVALID_STATUS", "Trạng thái lọc không hợp lệ");
    }

    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 100) : undefined;
    const page = query.page && query.page > 0 ? query.page : 1;
    const skip = limit ? (page - 1) * limit : undefined;

    if (user.role === "CANDIDATE") {
      const candidate = await this.candidateProfileRepo.findOne({
        where: { userId: user.id },
      });
      if (!candidate) {
        return [];
      }

      return this.applicationRepo.find({
        where: {
          candidateId: candidate.id,
          ...(query.status ? { status: query.status } : {}),
        },
        order: {
          appliedAt: "DESC",
          createdAt: "DESC",
        },
        ...(limit ? { take: limit, skip } : {}),
      });
    }

    if (user.role === "RECRUITER") {
      const company = await this.getCompanyByUserId(user.id);
      if (!company) {
        return [];
      }

      const qb = this.applicationRepo
        .createQueryBuilder("application")
        .innerJoin(Job, "job", "job.id = application.job_id")
        .where("job.company_id = :companyId", { companyId: company.id });

      if (query.jobId) {
        qb.andWhere("application.job_id = :jobId", {
          jobId: String(query.jobId),
        });
      }

      if (query.status) {
        qb.andWhere("application.status = :status", { status: query.status });
      }

      qb.orderBy("application.applied_at", "DESC").addOrderBy(
        "application.created_at",
        "DESC",
      );

      if (limit) {
        qb.take(limit).skip(skip);
      }

      return qb.getMany();
    }

    if (user.role === "ADMIN") {
      return this.applicationRepo.find({
        where: {
          ...(query.jobId ? { jobId: String(query.jobId) } : {}),
          ...(query.status ? { status: query.status } : {}),
        },
        order: {
          appliedAt: "DESC",
          createdAt: "DESC",
        },
        ...(limit ? { take: limit, skip } : {}),
      });
    }

    return [];
  }

  /** 3. Get application detail */
  async getApplicationById(
    user: { id: string; role: "CANDIDATE" | "RECRUITER" | "ADMIN" },
    id: string,
  ): Promise<ApplicationEntity> {
    const application = await this.applicationRepo.findOne({
      where: { id },
    });

    if (!application) {
      throw new AppError(
        404,
        "APPLICATION_NOT_FOUND",
        "Không tìm thấy đơn ứng tuyển",
      );
    }

    if (user.role === "CANDIDATE") {
      const candidate = await this.candidateProfileRepo.findOne({
        where: { userId: user.id },
      });
      if (!candidate || application.candidateId !== candidate.id) {
        throw new AppError(
          403,
          "FORBIDDEN",
          "Bạn không có quyền xem đơn ứng tuyển này",
        );
      }
    } else if (user.role === "RECRUITER") {
      const company = await this.getCompanyByUserId(user.id);
      if (!company) {
        throw new AppError(
          403,
          "FORBIDDEN",
          "Bạn không có quyền xem đơn ứng tuyển này",
        );
      }

      const job = await this.jobRepo.findOne({
        where: { id: application.jobId },
      });
      if (!job || job.companyId !== company.id) {
        throw new AppError(
          403,
          "FORBIDDEN",
          "Bạn không có quyền xem đơn ứng tuyển này",
        );
      }
    }

    return application;
  }

  /** 4. Update application status (Recruiter) */
  async updateStatus(
    user: { id: string; role: "CANDIDATE" | "RECRUITER" | "ADMIN" },
    id: string,
    dto: UpdateApplicationStatusDto,
  ): Promise<ApplicationEntity> {
    if (user.role !== "RECRUITER" && user.role !== "ADMIN") {
      throw new AppError(
        403,
        "FORBIDDEN",
        "Chỉ nhà tuyển dụng mới có quyền cập nhật trạng thái đơn",
      );
    }

    if (!dto.status || !Object.values(ApplicationStatus).includes(dto.status)) {
      throw new AppError(400, "INVALID_STATUS", "Trạng thái không hợp lệ");
    }

    if (dto.status === ApplicationStatus.WITHDRAWN) {
      throw new AppError(
        400,
        "INVALID_STATUS_TRANSITION",
        "Không thể cập nhật trạng thái WITHDRAWN qua API này",
      );
    }

    const application = await this.applicationRepo.findOne({
      where: { id },
    });
    if (!application) {
      throw new AppError(
        404,
        "APPLICATION_NOT_FOUND",
        "Không tìm thấy đơn ứng tuyển",
      );
    }

    const job = await this.jobRepo.findOne({
      where: { id: application.jobId },
    });

    if (user.role === "RECRUITER") {
      const company = await this.getCompanyByUserId(user.id);
      if (!company) {
        throw new AppError(
          403,
          "FORBIDDEN",
          "Bạn không có quyền cập nhật đơn ứng tuyển này",
        );
      }

      if (!job || job.companyId !== company.id) {
        throw new AppError(
          403,
          "FORBIDDEN",
          "Bạn không có quyền cập nhật đơn ứng tuyển này",
        );
      }
    }

    const allowedTransitions =
      ALLOWED_STATUS_TRANSITIONS[application.status] || [];
    if (!allowedTransitions.includes(dto.status)) {
      throw new AppError(
        400,
        "INVALID_STATUS_TRANSITION",
        `Không thể chuyển từ trạng thái ${application.status} sang ${dto.status}`,
      );
    }

    application.status = dto.status;
    const saved = await this.applicationRepo.save(application);

    // Gửi thông báo tới ứng viên khi trạng thái hồ sơ thay đổi
    try {
      const candidate = await this.candidateProfileRepo.findOne({
        where: { id: application.candidateId },
      });
      if (candidate?.userId && job?.title) {
        await notificationService.create({
          userId: candidate.userId,
          type: "APPLICATION_STATUS_CHANGED",
          target: { type: "APPLICATION", id: application.id },
          params: {
            jobTitle: job.title,
            status: dto.status,
          },
        });
      }
    } catch (notifErr) {
      console.error("Failed to send notification for APPLICATION_STATUS_CHANGED:", notifErr);
    }

    return saved;
  }

  /** 5. Withdraw application (Candidate) */
  async withdraw(userId: string, id: string): Promise<ApplicationEntity> {
    const application = await this.applicationRepo.findOne({
      where: { id },
    });
    if (!application) {
      throw new AppError(
        404,
        "APPLICATION_NOT_FOUND",
        "Không tìm thấy đơn ứng tuyển",
      );
    }

    const candidate = await this.candidateProfileRepo.findOne({
      where: { userId },
    });
    if (!candidate || application.candidateId !== candidate.id) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "Bạn không có quyền rút đơn ứng tuyển này",
      );
    }

    if (
      application.status !== ApplicationStatus.APPLIED &&
      application.status !== ApplicationStatus.VIEWED
    ) {
      throw new AppError(
        400,
        "CANNOT_WITHDRAW",
        "Chỉ có thể rút đơn khi đang ở trạng thái APPLIED hoặc VIEWED",
      );
    }

    application.status = ApplicationStatus.WITHDRAWN;
    return this.applicationRepo.save(application);
  }

  /**
   * 6. Save job (Idempotent, race-condition safe)
   */
  async saveJob(
    userId: string,
    jobId: string,
  ): Promise<{ isNew: boolean; data: SavedJobEntity }> {
    const candidate = await this.getCandidateProfileByUserId(userId);

    const job = await this.jobRepo.findOne({
      where: { id: jobId },
    });
    if (!job) {
      throw new AppError(404, "JOB_NOT_FOUND", "Công việc không tồn tại");
    }

    const existing = await this.savedJobRepo.findOne({
      where: {
        candidateId: candidate.id,
        jobId,
      },
    });

    if (existing) {
      return { isNew: false, data: existing };
    }

    try {
      const savedJob = this.savedJobRepo.create({
        candidateId: candidate.id,
        jobId,
      });
      const saved = await this.savedJobRepo.save(savedJob);
      return { isNew: true, data: saved };
    } catch (err: any) {
      if (err?.code === "23505") {
        const current = await this.savedJobRepo.findOne({
          where: { candidateId: candidate.id, jobId },
        });
        if (current) {
          return { isNew: false, data: current };
        }
      }
      throw err;
    }
  }

  /** 7. Unsave job */
  async unsaveJob(userId: string, jobId: string): Promise<void> {
    const candidate = await this.candidateProfileRepo.findOne({
      where: { userId },
    });
    if (!candidate) {
      return;
    }

    const existing = await this.savedJobRepo.findOne({
      where: {
        candidateId: candidate.id,
        jobId,
      },
    });

    if (existing) {
      await this.savedJobRepo.remove(existing);
    }
  }

  /** 8. List saved jobs */
  async listSavedJobs(userId: string): Promise<SavedJobEntity[]> {
    const candidate = await this.candidateProfileRepo.findOne({
      where: { userId },
    });
    if (!candidate) {
      return [];
    }

    return this.savedJobRepo.find({
      where: {
        candidateId: candidate.id,
      },
      order: {
        createdAt: "DESC",
      },
    });
  }
>>>>>>> 0d751e5 (Lưu tạm code phần Application & Saved Jobs để pull main)
}

export const applicationsService = new ApplicationsService();
