import { AppDataSource } from "@/data-source";
import { AppError } from "@/common/errors/app-error";
import { Job } from "@/database/entities/job.entity";
import { JOB_STATUS } from "@/common/constants/job";
import { notificationService } from "@/modules/notifications/notification.service";
import { logService } from "@/modules/system-logs/log.service";
import { ListQuery } from "./jobs.validation";

const repo = () => AppDataSource.getRepository(Job);

/** Shape trả về cho list — company/category chỉ trả {id,name}, không lộ field thô. */
const toListItem = (job: Job) => ({
  id: job.id,
  title: job.title,
  slug: job.slug,
  company: { id: job.company.id, name: job.company.name },
  category: { id: job.category.id, name: job.category.name },
  jobType: job.jobType,
  jobMode: job.jobMode,
  salaryMin: job.salaryMin,
  salaryMax: job.salaryMax,
  isNegotiable: job.isNegotiable,
  quantity: job.quantity,
  deadline: job.deadline,
  status: job.status,
  rejectReason: job.rejectReason,
  createdAt: job.createdAt,
});

/** Shape trả về cho detail — thêm mô tả đầy đủ + `skills` join từ `job_skills`. */
const toDetail = (job: Job) => ({
  ...toListItem(job),
  description: job.description,
  requirements: job.requirements,
  benefits: job.benefits,
  address: job.address,
  experience: job.experience,
  skills: job.jobSkills.map((jobSkill) => ({
    id: jobSkill.skill.id,
    name: jobSkill.skill.name,
    isRequired: jobSkill.isRequired,
  })),
  updatedAt: job.updatedAt,
});

export type PaginatedJobs = {
  items: ReturnType<typeof toListItem>[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export const adminJobsService = {
  /** GET /admin/jobs — lọc theo search/status/companyId/categoryId, phân trang. */
  async list(query: ListQuery): Promise<PaginatedJobs> {
    const qb = repo()
      .createQueryBuilder("job")
      .innerJoinAndSelect("job.company", "company")
      .innerJoinAndSelect("job.category", "category");

    if (query.search) {
      qb.andWhere("job.title ILIKE :search", { search: `%${query.search}%` });
    }
    if (query.status) {
      qb.andWhere("job.status = :status", { status: query.status });
    }
    if (query.companyId) {
      qb.andWhere("job.companyId = :companyId", { companyId: query.companyId });
    }
    if (query.categoryId) {
      qb.andWhere("job.categoryId = :categoryId", { categoryId: query.categoryId });
    }

    qb.orderBy("job.createdAt", "DESC");
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [jobs, total] = await qb.getManyAndCount();

    return {
      items: jobs.map(toListItem),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  /** GET /admin/jobs/{id}. */
  async detail(id: string) {
    const job = await repo().findOne({
      where: { id },
      relations: { company: true, category: true, jobSkills: { skill: true } },
    });
    if (!job) {
      throw new AppError(404, "NOT_FOUND", "Không tìm thấy tin tuyển dụng");
    }

    return toDetail(job);
  },

  /** PUT /admin/jobs/{id}/approve — chỉ duyệt được tin đang PENDING. */
  async approve(actingUserId: string, id: string) {
    return AppDataSource.transaction(async (manager) => {
      const jobRepo = manager.getRepository(Job);
      const job = await jobRepo.findOne({ where: { id }, relations: { company: true } });
      if (!job) {
        throw new AppError(404, "NOT_FOUND", "Không tìm thấy tin tuyển dụng");
      }
      if (job.status !== JOB_STATUS.PENDING) {
        throw new AppError(409, "CONFLICT", "Chỉ duyệt được tin đang ở trạng thái chờ duyệt");
      }

      job.status = JOB_STATUS.APPROVED;
      await jobRepo.save(job);

      await logService.write(
        {
          userId: actingUserId,
          action: "APPROVE_JOB",
          target: { type: "JOB", id: job.id },
          oldValue: JOB_STATUS.PENDING,
          newValue: JOB_STATUS.APPROVED,
        },
        manager,
      );

      await notificationService.create(
        {
          userId: job.company.userId,
          type: "JOB_APPROVED",
          target: { type: "JOB", id: job.id },
          params: { jobTitle: job.title },
        },
        manager,
      );

      return { id: job.id, title: job.title, status: job.status, updatedAt: job.updatedAt };
    });
  },

  /** PUT /admin/jobs/{id}/reject — chỉ từ chối được tin đang PENDING, ghi kèm lý do. */
  async reject(actingUserId: string, id: string, reason: string) {
    return AppDataSource.transaction(async (manager) => {
      const jobRepo = manager.getRepository(Job);
      const job = await jobRepo.findOne({ where: { id }, relations: { company: true } });
      if (!job) {
        throw new AppError(404, "NOT_FOUND", "Không tìm thấy tin tuyển dụng");
      }
      if (job.status !== JOB_STATUS.PENDING) {
        throw new AppError(409, "CONFLICT", "Chỉ từ chối được tin đang ở trạng thái chờ duyệt");
      }

      job.status = JOB_STATUS.REJECTED;
      job.rejectReason = reason;
      await jobRepo.save(job);

      await logService.write(
        {
          userId: actingUserId,
          action: "REJECT_JOB",
          target: { type: "JOB", id: job.id },
          oldValue: JOB_STATUS.PENDING,
          newValue: JOB_STATUS.REJECTED,
          description: reason,
        },
        manager,
      );

      await notificationService.create(
        {
          userId: job.company.userId,
          type: "JOB_REJECTED",
          target: { type: "JOB", id: job.id },
          params: { jobTitle: job.title, reason },
        },
        manager,
      );

      return {
        id: job.id,
        title: job.title,
        status: job.status,
        rejectReason: job.rejectReason,
        updatedAt: job.updatedAt,
      };
    });
  },

  /** DELETE /admin/jobs/{id} — xóa mềm, không giới hạn trạng thái hiện tại của tin. */
  async remove(actingUserId: string, id: string, reason?: string): Promise<void> {
    return AppDataSource.transaction(async (manager) => {
      const jobRepo = manager.getRepository(Job);
      const job = await jobRepo.findOne({ where: { id }, relations: { company: true } });
      if (!job) {
        throw new AppError(404, "NOT_FOUND", "Không tìm thấy tin tuyển dụng");
      }

      const statusBeforeDelete = job.status;
      await jobRepo.softDelete(job.id);

      const deleteReason = reason || "Đã xóa bởi quản trị viên";

      await logService.write(
        {
          userId: actingUserId,
          action: "DELETE_JOB",
          target: { type: "JOB", id: job.id },
          oldValue: statusBeforeDelete,
          newValue: null,
          description: deleteReason,
        },
        manager,
      );

      await notificationService.create(
        {
          userId: job.company.userId,
          type: "JOB_DELETED",
          target: { type: "JOB", id: job.id },
          params: { jobTitle: job.title, reason: deleteReason },
        },
        manager,
      );
    });
  },
};
