import { AppDataSource } from "../../data-source";
import { ApplicationEntity } from "../../database/entities/application.entity";
import { SavedJobEntity } from "../../database/entities/saved-job.entity";
import { CandidateProfileEntity } from "../../database/entities/candidate-profile.entity";
import { ResumeEntity } from "../../database/entities/resume.entity";
import { Job } from "../../database/entities/job.entity";
import { Company } from "../../database/entities/company.entity";
import { UserEntity } from "../../database/entities/user.entity";
import { EducationEntity } from "../../database/entities/education.entity";
import { WorkExperienceEntity } from "../../database/entities/work-experience.entity";
import { CandidateSkillEntity } from "../../database/entities/candidate-skill.entity";
import { JobCategory } from "../../database/entities/job-category.entity";
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

export type ApplicationListItemDto = {
  id: string;
  candidateId: string;
  jobId: string;
  resumeId: string | null;
  resumeSnapshotUrl: string | null;
  status: ApplicationStatus;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  candidate?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    experienceCount: number;
  };
  job?: {
    id: string;
    title: string;
    companyName?: string | null;
    companyLogoUrl?: string | null;
    location?: string | null;
    salaryMin?: number | string | null;
    salaryMax?: number | string | null;
    isNegotiable?: boolean;
    status?: string | null;
    deadline?: string | Date | null;
    categoryName?: string | null;
    company?: {
      id?: string;
      name?: string;
      logo?: string | null;
      website?: string | null;
      description?: string | null;
      companySize?: string | null;
      address?: string | null;
    };
    category?: {
      id?: string;
      name?: string;
      slug?: string;
    };
    description?: string | null;
    requirements?: string | null;
    benefits?: string | null;
    jobType?: string | null;
    jobMode?: string | null;
    experience?: number | null;
    quantity?: number | null;
  };
  resume?: {
    id: string;
    fileName: string;
  } | null;
};

export type ApplicationDetailDto = ApplicationListItemDto & {
  candidateProfile?: {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    dateOfBirth: string | null;
    addressDetail: string | null;
    bio: string | null;
    careerObjective: string | null;
    educations: EducationEntity[];
    workExperiences: WorkExperienceEntity[];
    skills: CandidateSkillEntity[];
    languages: CandidateSkillEntity[];
    certificates: CandidateSkillEntity[];
    createdAt: Date;
    updatedAt: Date;
  };
};

type ApplicationListRaw = {
  id: string;
  candidateId: string;
  jobId: string;
  resumeId: string | null;
  resumeSnapshotUrl: string | null;
  status: ApplicationStatus;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  candidateName: string | null;
  candidateEmail: string | null;
  candidatePhone: string | null;
  candidateAvatar: string | null;
  experienceCount: string | number | null;
  jobTitle: string | null;
  companyName: string | null;
  companyLogoUrl: string | null;
  jobLocation: string | null;
  salaryMin: number | string | null;
  salaryMax: number | string | null;
  isNegotiable: boolean | string | null;
  jobStatus: string | null;
  jobDeadline: string | Date | null;
  categoryName: string | null;
  resumeFileName: string | null;
};

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

  private get educationRepo() {
    return AppDataSource.getRepository(EducationEntity);
  }

  private get workExperienceRepo() {
    return AppDataSource.getRepository(WorkExperienceEntity);
  }

  private get candidateSkillRepo() {
    return AppDataSource.getRepository(CandidateSkillEntity);
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
    if (job.status !== JOB_STATUS.OPEN && job.status !== JOB_STATUS.APPROVED) {
      throw new AppError(
        400,
        "JOB_CLOSED",
        "Công việc không còn nhận hồ sơ ứng tuyển",
      );
    }

    if (job.deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(job.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        throw new AppError(
          400,
          "JOB_CLOSED",
          "Công việc đã hết hạn nhận hồ sơ ứng tuyển",
        );
      }
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
  ): Promise<ApplicationListItemDto[]> {
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

      const qb = this.createApplicationListQuery()
        .where("application.candidate_id = :candidateId", {
          candidateId: candidate.id,
        });

      if (query.status) {
        qb.andWhere("application.status = :status", { status: query.status });
      }

      this.applyApplicationListOrdering(qb);

      if (limit) {
        qb.limit(limit).offset(skip);
      }

      return this.getApplicationListDtos(qb);
    }

    if (user.role === "RECRUITER") {
      const company = await this.getCompanyByUserId(user.id);
      if (!company) {
        return [];
      }

      const qb = this.createApplicationListQuery()
        .where("job.company_id = :companyId", { companyId: company.id });

      if (query.jobId) {
        qb.andWhere("application.job_id = :jobId", {
          jobId: String(query.jobId),
        });
      }

      if (query.status) {
        qb.andWhere("application.status = :status", { status: query.status });
      }

      this.applyApplicationListOrdering(qb);

      if (limit) {
        qb.limit(limit).offset(skip);
      }

      return this.getApplicationListDtos(qb);
    }

    if (user.role === "ADMIN") {
      const qb = this.createApplicationListQuery();

      if (query.jobId) {
        qb.where("application.job_id = :jobId", {
          jobId: String(query.jobId),
        });
      }

      if (query.status) {
        if (query.jobId) {
          qb.andWhere("application.status = :status", { status: query.status });
        } else {
          qb.where("application.status = :status", { status: query.status });
        }
      }

      this.applyApplicationListOrdering(qb);

      if (limit) {
        qb.limit(limit).offset(skip);
      }

      return this.getApplicationListDtos(qb);
    }

    return [];
  }

  /** 3. Get application detail */
  async getApplicationById(
    user: { id: string; role: "CANDIDATE" | "RECRUITER" | "ADMIN" },
    id: string,
  ): Promise<ApplicationDetailDto> {
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

    return this.getApplicationDetailDto(application);
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
      relations: ["job", "job.company", "job.category", "job.jobSkills", "job.jobSkills.skill"],
      order: {
        createdAt: "DESC",
      },
    });
  }

  private createApplicationListQuery() {
    return this.applicationRepo
      .createQueryBuilder("application")
      .innerJoin(Job, "job", "job.id = application.job_id")
      .leftJoin(Company, "company", "company.id = job.company_id")
      .leftJoin(JobCategory, "category", "category.id = job.category_id")
      .leftJoin(CandidateProfileEntity, "candidate", "candidate.id = application.candidate_id")
      .leftJoin(UserEntity, "candidateUser", "candidateUser.id = candidate.user_id")
      .leftJoin(ResumeEntity, "resume", "resume.id = application.resume_id")
      .leftJoin(
        "work_experiences",
        "workExperience",
        "workExperience.candidate_id = candidate.id",
      )
      .select("application.id", "id")
      .addSelect("application.candidate_id", "candidateId")
      .addSelect("application.job_id", "jobId")
      .addSelect("application.resume_id", "resumeId")
      .addSelect("application.resume_snapshot_url", "resumeSnapshotUrl")
      .addSelect("application.status", "status")
      .addSelect("application.applied_at", "appliedAt")
      .addSelect("application.created_at", "createdAt")
      .addSelect("application.updated_at", "updatedAt")
      .addSelect("candidateUser.full_name", "candidateName")
      .addSelect("candidateUser.email", "candidateEmail")
      .addSelect("candidateUser.phone", "candidatePhone")
      .addSelect("candidateUser.avatar", "candidateAvatar")
      .addSelect("job.title", "jobTitle")
      .addSelect("company.name", "companyName")
      .addSelect("company.logo", "companyLogoUrl")
      .addSelect("job.address", "jobLocation")
      .addSelect("job.salary_min", "salaryMin")
      .addSelect("job.salary_max", "salaryMax")
      .addSelect("job.is_negotiable", "isNegotiable")
      .addSelect("job.status", "jobStatus")
      .addSelect("job.deadline", "jobDeadline")
      .addSelect("category.name", "categoryName")
      .addSelect("resume.file_name", "resumeFileName")
      .addSelect("COUNT(workExperience.id)", "experienceCount")
      .groupBy("application.id")
      .addGroupBy("application.candidate_id")
      .addGroupBy("application.job_id")
      .addGroupBy("application.resume_id")
      .addGroupBy("application.resume_snapshot_url")
      .addGroupBy("application.status")
      .addGroupBy("application.applied_at")
      .addGroupBy("application.created_at")
      .addGroupBy("application.updated_at")
      .addGroupBy("candidateUser.full_name")
      .addGroupBy("candidateUser.email")
      .addGroupBy("candidateUser.phone")
      .addGroupBy("candidateUser.avatar")
      .addGroupBy("job.title")
      .addGroupBy("company.name")
      .addGroupBy("company.logo")
      .addGroupBy("job.address")
      .addGroupBy("job.salary_min")
      .addGroupBy("job.salary_max")
      .addGroupBy("job.is_negotiable")
      .addGroupBy("job.status")
      .addGroupBy("job.deadline")
      .addGroupBy("category.name")
      .addGroupBy("resume.file_name");
  }

  private applyApplicationListOrdering(
    qb: ReturnType<ApplicationsService["createApplicationListQuery"]>,
  ): void {
    qb.orderBy("application.applied_at", "DESC").addOrderBy(
      "application.created_at",
      "DESC",
    );
  }

  private async getApplicationListDtos(
    qb: ReturnType<ApplicationsService["createApplicationListQuery"]>,
  ): Promise<ApplicationListItemDto[]> {
    const rows = await qb.getRawMany<ApplicationListRaw>();

    return rows.map((row) => ({
      id: String(row.id),
      candidateId: String(row.candidateId),
      jobId: String(row.jobId),
      resumeId: row.resumeId === null ? null : String(row.resumeId),
      resumeSnapshotUrl: row.resumeSnapshotUrl,
      status: row.status,
      appliedAt: row.appliedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      candidate: row.candidateName && row.candidateEmail
        ? {
            id: String(row.candidateId),
            fullName: row.candidateName,
            email: row.candidateEmail,
            phone: row.candidatePhone,
            avatar: row.candidateAvatar,
            experienceCount: Number(row.experienceCount ?? 0),
          }
        : undefined,
      job: row.jobTitle
        ? {
            id: String(row.jobId),
            title: row.jobTitle,
            companyName: row.companyName,
            companyLogoUrl: row.companyLogoUrl,
            location: row.jobLocation,
            salaryMin: row.salaryMin,
            salaryMax: row.salaryMax,
            isNegotiable: row.isNegotiable === true || String(row.isNegotiable) === "true",
            status: row.jobStatus,
            deadline: row.jobDeadline,
            categoryName: row.categoryName,
          }
        : undefined,
      resume: row.resumeId && row.resumeFileName
        ? {
            id: String(row.resumeId),
            fileName: row.resumeFileName,
          }
        : null,
    }));
  }

  private async getApplicationDetailDto(
    application: ApplicationEntity,
  ): Promise<ApplicationDetailDto> {
    const [candidate, job, resume, educations, workExperiences, candidateSkills] =
      await Promise.all([
        this.candidateProfileRepo.findOne({
          where: { id: application.candidateId },
          relations: { user: true },
        }),
        this.jobRepo.findOne({
          where: { id: application.jobId },
          relations: ["company", "category", "jobSkills", "jobSkills.skill"],
        }),
        application.resumeId
          ? this.resumeRepo.findOne({ where: { id: application.resumeId } })
          : Promise.resolve(null),
        this.educationRepo.find({
          where: { candidateId: application.candidateId },
          order: { createdAt: "DESC" },
        }),
        this.workExperienceRepo.find({
          where: { candidateId: application.candidateId },
          order: { createdAt: "DESC" },
        }),
        this.candidateSkillRepo.find({
          where: { candidateId: application.candidateId },
          relations: { skill: true },
          order: { createdAt: "DESC" },
        }),
      ]);

    const skills: CandidateSkillEntity[] = [];
    const languages: CandidateSkillEntity[] = [];
    const certificates: CandidateSkillEntity[] = [];

    for (const item of candidateSkills) {
      if (item.skill?.category === "LANGUAGE") {
        languages.push(item);
      } else if (item.skill?.category === "CERTIFICATE") {
        certificates.push(item);
      } else {
        skills.push(item);
      }
    }

    return {
      id: application.id,
      candidateId: application.candidateId,
      jobId: application.jobId,
      resumeId: application.resumeId,
      resumeSnapshotUrl: application.resumeSnapshotUrl,
      status: application.status,
      appliedAt: application.appliedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      candidate: candidate?.user
        ? {
            id: application.candidateId,
            fullName: candidate.user.fullName,
            email: candidate.user.email,
            phone: candidate.user.phone,
            avatar: candidate.user.avatar,
            experienceCount: workExperiences.length,
          }
        : undefined,
      job: job
        ? {
            id: job.id,
            title: job.title,
            companyName: job.company?.name,
            companyLogoUrl: job.company?.logo,
            company: job.company
              ? {
                  id: job.company.id,
                  name: job.company.name,
                  logo: job.company.logo,
                  website: job.company.website,
                  description: job.company.description,
                  companySize: job.company.companySize,
                  address: job.company.address,
                }
              : undefined,
            category: job.category
              ? {
                  id: job.category.id,
                  name: job.category.name,
                  slug: job.category.slug,
                }
              : undefined,
            categoryName: job.category?.name,
            location: job.address,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            isNegotiable: job.isNegotiable,
            status: job.status,
            deadline: job.deadline,
            description: job.description,
            requirements: job.requirements,
            benefits: job.benefits,
            jobType: job.jobType,
            jobMode: job.jobMode,
            experience: job.experience,
            quantity: job.quantity,
          }
        : undefined,
      resume: resume
        ? {
            id: resume.id,
            fileName: resume.fileName,
          }
        : null,
      candidateProfile: candidate?.user
        ? {
            id: candidate.id,
            userId: candidate.userId,
            fullName: candidate.user.fullName,
            email: candidate.user.email,
            phone: candidate.user.phone,
            avatar: candidate.user.avatar,
            dateOfBirth: candidate.user.dateOfBirth,
            addressDetail: candidate.user.addressDetail,
            bio: candidate.bio,
            careerObjective: candidate.careerObjective,
            educations,
            workExperiences,
            skills,
            languages,
            certificates,
            createdAt: candidate.createdAt,
            updatedAt: candidate.updatedAt,
          }
        : undefined,
    };
  }
}

export const applicationsService = new ApplicationsService();
