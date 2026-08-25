import { AppDataSource } from "@/data-source";
import { AppError } from "@/common/errors/app-error";
import { Company } from "@/database/entities/company.entity";
import { Job } from "@/database/entities/job.entity";
import { CompanyStatusValue } from "@/common/constants/job";
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

/** Shape trả về cho list — kèm `owner` (recruiter chủ sở hữu) và `totalJobs`. */
const toListItem = (company: Company, totalJobs: number) => ({
  id: company.id,
  name: company.name,
  slug: company.slug,
  logo: company.logo,
  email: company.email,
  phone: company.phone,
  taxCode: company.taxCode,
  companySize: company.companySize,
  address: company.address,
  status: company.status,
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
};

export const adminCompaniesService = {
  /** GET /admin/companies — lọc theo search/status, phân trang. */
  async list(query: ListQuery): Promise<PaginatedCompanies> {
    const qb = repo().createQueryBuilder("company").innerJoinAndSelect("company.user", "owner");

    if (query.search) {
      qb.andWhere("(company.name ILIKE :search OR company.email ILIKE :search)", {
        search: `%${query.search}%`,
      });
    }
    if (query.status) {
      qb.andWhere("company.status = :status", { status: query.status });
    }

    qb.orderBy("company.createdAt", "DESC");
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [companies, total] = await qb.getManyAndCount();
    const jobCounts = await countJobsByCompany(companies.map((c) => c.id));

    return {
      items: companies.map((company) => toListItem(company, jobCounts.get(company.id) ?? 0)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
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
      if (company.status === body.status) {
        throw new AppError(409, "CONFLICT", "Công ty đã ở trạng thái này");
      }

      const oldStatus = company.status;
      company.status = body.status as CompanyStatusValue;
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

      await notificationService.create(
        {
          userId: company.userId,
          type: isLocking ? "COMPANY_LOCKED" : "COMPANY_UNLOCKED",
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
};
