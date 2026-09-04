import { AppDataSource } from "@/data-source";
import { AppError } from "@/common/errors/app-error";
import { Company } from "@/database/entities/company.entity";
import { Job } from "@/database/entities/job.entity";
import { COMPANY_STATUS, CompanyStatusValue } from "@/common/constants/job";
import { ASSET_TYPE, storageService } from "@/common/storage";
import { notificationService } from "@/modules/notifications/notification.service";
import { logService } from "@/modules/system-logs/log.service";
import { ListQuery, StatusBody } from "./companies.validation";

const repo = () => AppDataSource.getRepository(Company);

/** Đếm job còn sống (`deleted_at IS NULL`) theo lô cho các company trong trang hiện tại. */
const countJobsByCompany = async (companyIds: string[]): Promise<Map<string, number>> => {
  if (companyIds.length === 0) return new Map();

  const rows: Array<{ companyId: string; count: string }> = await AppDataSource.getRepository(Job)
    .createQueryBuilder("job")
    .select("job.companyId", "companyId")
    .addSelect("COUNT(*)", "count")
    .where("job.companyId IN (:...companyIds)", { companyIds })
    .andWhere("job.deletedAt IS NULL")
    .groupBy("job.companyId")
    .getRawMany();

  return new Map(rows.map((row) => [row.companyId, Number(row.count)]));
};

const countCompanyStats = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const row = await repo()
    .createQueryBuilder("statsCompany")
    .select("COUNT(*)", "total")
    .addSelect(
      'COUNT(*) FILTER (WHERE "statsCompany"."status" = :activeStatus)',
      "active",
    )
    .addSelect(
      'COUNT(*) FILTER (WHERE "statsCompany"."status" = :blockedStatus)',
      "blocked",
    )
    .addSelect(
      'COUNT(*) FILTER (WHERE "statsCompany"."created_at" >= :thirtyDaysAgo)',
      "newThisMonth",
    )
    .setParameters({
      activeStatus: COMPANY_STATUS.ACTIVE,
      blockedStatus: COMPANY_STATUS.BLOCKED,
      thirtyDaysAgo,
    })
    .getRawOne<{
      total: string | null;
      active: string | null;
      blocked: string | null;
      newThisMonth: string | null;
    }>();

  return {
    total: Number(row?.total ?? 0),
    active: Number(row?.active ?? 0),
    blocked: Number(row?.blocked ?? 0),
    newThisMonth: Number(row?.newThisMonth ?? 0),
  };
};

/** Shape trả về cho list — kèm `owner` (recruiter chủ sở hữu) và `totalJobs`. */
const toListItem = (company: Company, totalJobs: number) => ({
  id: company.id,
  name: company.name,
  slug: company.slug,
  logo: storageService.resolvePublicUrl(company.logo, ASSET_TYPE.COMPANY_LOGO),
  email: company.email,
  phone: company.phone,
  taxCode: company.taxCode,
  companySize: company.companySize,
  address: company.address,
  status: company.status,
  rejectReason: company.rejectReason,
  owner: { id: company.user.id, fullName: company.user.fullName, email: company.user.email },
  totalJobs,
  createdAt: company.createdAt,
});

/** Shape trả về cho detail — thêm website/description so với list item. */
const toDetail = (company: Company, totalJobs: number) => ({
  ...toListItem(company, totalJobs),
  website: company.website,
  description: company.description,
  updatedAt: company.updatedAt,
});

export type PaginatedCompanies = {
  items: ReturnType<typeof toListItem>[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  stats: Awaited<ReturnType<typeof countCompanyStats>>;
};

export const adminCompaniesService = {
  /** GET /admin/companies — lọc theo search/status, phân trang. */
  async list(query: ListQuery): Promise<PaginatedCompanies> {
    const qb = repo().createQueryBuilder("company").innerJoinAndSelect("company.user", "owner");

    if (query.search) {
      qb.andWhere(
        "(company.name ILIKE :search OR company.email ILIKE :search OR company.taxCode ILIKE :search)",
        {
          search: `%${query.search}%`,
        },
      );
    }
    if (query.status) {
      qb.andWhere("company.status = :status", { status: query.status });
    }
    if (query.createdFrom) {
      qb.andWhere("company.createdAt >= :createdFrom", {
        createdFrom: new Date(`${query.createdFrom}T00:00:00.000Z`),
      });
    }
    if (query.createdTo) {
      qb.andWhere("company.createdAt <= :createdTo", {
        createdTo: new Date(`${query.createdTo}T23:59:59.999Z`),
      });
    }

    qb.orderBy("company.createdAt", "DESC");
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [[companies, total], stats] = await Promise.all([
      qb.getManyAndCount(),
      countCompanyStats(),
    ]);
    const jobCounts = await countJobsByCompany(companies.map((c) => c.id));

    return {
      items: companies.map((company) => toListItem(company, jobCounts.get(company.id) ?? 0)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
      stats,
    };
  },

  /** GET /admin/companies/{id}. */
  async detail(id: string) {
    const company = await repo().findOne({ where: { id }, relations: { user: true } });
    if (!company) {
      throw new AppError(404, "NOT_FOUND", "Không tìm thấy công ty");
    }

    const jobCounts = await countJobsByCompany([company.id]);
    return toDetail(company, jobCounts.get(company.id) ?? 0);
  },

  /**
   * PUT /admin/companies/{id}/status — khóa/mở khóa 1 công ty.
   * Gộp 1 transaction: đổi status + ghi log + bắn thông báo cho recruiter chủ sở hữu.
   */
  async updateStatus(actingUserId: string, id: string, body: StatusBody) {
    return AppDataSource.transaction(async (manager) => {
      const companyRepo = manager.getRepository(Company);
      const company = await companyRepo.findOne({ where: { id }, relations: { user: true } });
      if (!company) {
        throw new AppError(404, "NOT_FOUND", "Không tìm thấy công ty");
      }
      // Chỉ khóa/mở khóa công ty đã qua duyệt (ACTIVE/BLOCKED) — công ty đang PENDING/REJECTED
      // phải đi qua approve()/reject(), không được nhảy thẳng sang BLOCKED.
      if (company.status !== COMPANY_STATUS.ACTIVE && company.status !== COMPANY_STATUS.BLOCKED) {
        throw new AppError(
          409,
          "CONFLICT",
          "Chỉ khóa/mở khóa được công ty đã qua duyệt (ACTIVE hoặc BLOCKED)",
        );
      }
      if (company.status === body.status) {
        throw new AppError(409, "CONFLICT", "Công ty đã ở trạng thái này");
      }

      const oldStatus = company.status;
      company.status = body.status as CompanyStatusValue;
      company.rejectReason = body.status === COMPANY_STATUS.BLOCKED ? (body.reason ?? null) : null;
      await companyRepo.save(company);

      const isLocking = body.status === "BLOCKED";

      await logService.write(
        {
          userId: actingUserId,
          action: isLocking ? "LOCK_COMPANY" : "UNLOCK_COMPANY",
          target: { type: "COMPANY", id: company.id },
          oldValue: oldStatus,
          newValue: body.status,
          description: isLocking ? (body.reason ?? null) : null,
        },
        manager,
      );

      if (isLocking) {
        await notificationService.create(
          {
            userId: company.userId,
            type: "COMPANY_LOCKED",
            target: { type: "COMPANY", id: company.id },
            params: {
              companyName: company.name,
              reason: body.reason ?? "Không có lý do cụ thể",
            },
          },
          manager,
        );
      } else {
        await notificationService.create(
          {
            userId: company.userId,
            type: "COMPANY_UNLOCKED",
            target: { type: "COMPANY", id: company.id },
            params: { companyName: company.name },
          },
          manager,
        );
      }

      return {
        id: company.id,
        name: company.name,
        status: company.status,
        rejectReason: company.rejectReason,
        updatedAt: company.updatedAt,
      };
    });
  },

  /** PUT /admin/companies/{id}/approve — chỉ duyệt được hồ sơ đang PENDING. */
  async approve(actingUserId: string, id: string) {
    return AppDataSource.transaction(async (manager) => {
      const companyRepo = manager.getRepository(Company);
      const company = await companyRepo.findOne({ where: { id }, relations: { user: true } });
      if (!company) {
        throw new AppError(404, "NOT_FOUND", "Không tìm thấy công ty");
      }
      if (company.status !== COMPANY_STATUS.PENDING) {
        throw new AppError(409, "CONFLICT", "Chỉ duyệt được hồ sơ đang ở trạng thái chờ duyệt");
      }

      company.status = COMPANY_STATUS.ACTIVE;
      await companyRepo.save(company);

      await logService.write(
        {
          userId: actingUserId,
          action: "APPROVE_COMPANY",
          target: { type: "COMPANY", id: company.id },
          oldValue: COMPANY_STATUS.PENDING,
          newValue: COMPANY_STATUS.ACTIVE,
        },
        manager,
      );

      await notificationService.create(
        {
          userId: company.userId,
          type: "COMPANY_APPROVED",
          target: { type: "COMPANY", id: company.id },
          params: { companyName: company.name },
        },
        manager,
      );

      return {
        id: company.id,
        name: company.name,
        status: company.status,
        updatedAt: company.updatedAt,
      };
    });
  },

  /** PUT /admin/companies/{id}/reject — chỉ từ chối được hồ sơ đang PENDING, ghi kèm lý do. */
  async reject(actingUserId: string, id: string, reason: string) {
    return AppDataSource.transaction(async (manager) => {
      const companyRepo = manager.getRepository(Company);
      const company = await companyRepo.findOne({ where: { id }, relations: { user: true } });
      if (!company) {
        throw new AppError(404, "NOT_FOUND", "Không tìm thấy công ty");
      }
      if (company.status !== COMPANY_STATUS.PENDING) {
        throw new AppError(409, "CONFLICT", "Chỉ từ chối được hồ sơ đang ở trạng thái chờ duyệt");
      }

      company.status = COMPANY_STATUS.REJECTED;
      company.rejectReason = reason;
      await companyRepo.save(company);

      await logService.write(
        {
          userId: actingUserId,
          action: "REJECT_COMPANY",
          target: { type: "COMPANY", id: company.id },
          oldValue: COMPANY_STATUS.PENDING,
          newValue: COMPANY_STATUS.REJECTED,
          description: reason,
        },
        manager,
      );

      await notificationService.create(
        {
          userId: company.userId,
          type: "COMPANY_REJECTED",
          target: { type: "COMPANY", id: company.id },
          params: { companyName: company.name, reason },
        },
        manager,
      );

      return {
        id: company.id,
        name: company.name,
        status: company.status,
        rejectReason: company.rejectReason,
        updatedAt: company.updatedAt,
      };
    });
  },
};
