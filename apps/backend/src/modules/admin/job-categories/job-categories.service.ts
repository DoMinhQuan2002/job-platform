import { AppDataSource } from "@/data-source";
import { AppError } from "@/common/errors/app-error";
import { JobCategory } from "@/database/entities/job-category.entity";
import { Job } from "@/database/entities/job.entity";
import { JOB_CATEGORY_STATUS, JobCategoryStatusValue } from "@/common/constants/job";
import { logService } from "@/modules/system-logs/log.service";
import { ListQuery, CreateBody, UpdateBody } from "./job-categories.validation";

const repo = () => AppDataSource.getRepository(JobCategory);
const jobRepo = () => AppDataSource.getRepository(Job);

/** Không dùng thư viện ngoài — chỉ cần bỏ dấu tiếng Việt + thay ký tự lạ bằng "-". */
const slugify = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Đếm job còn sống theo 1 category — dùng để hiển thị `totalJobs` trong response. */
const countActiveJobs = async (categoryId: string): Promise<number> =>
  jobRepo().count({ where: { categoryId } });

const toItem = (category: JobCategory, totalJobs: number) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  status: category.status,
  totalJobs,
  createdAt: category.createdAt,
});

export type PaginatedJobCategories = {
  items: ReturnType<typeof toItem>[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export const adminJobCategoriesService = {
  /** GET /admin/job-categories — lọc theo search/status, phân trang. */
  async list(query: ListQuery): Promise<PaginatedJobCategories> {
    const qb = repo().createQueryBuilder("category");

    if (query.search) {
      qb.andWhere("category.name ILIKE :search", { search: `%${query.search}%` });
    }
    if (query.status) {
      qb.andWhere("category.status = :status", { status: query.status });
    }

    qb.orderBy("category.createdAt", "DESC");
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [categories, total] = await qb.getManyAndCount();
    const items = await Promise.all(
      categories.map(async (category) => toItem(category, await countActiveJobs(category.id))),
    );

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  /** GET /admin/job-categories/{id}. */
  async detail(id: string) {
    const category = await repo().findOneBy({ id });
    if (!category) {
      throw new AppError(404, "NOT_FOUND", "Không tìm thấy ngành nghề");
    }

    return toItem(category, await countActiveJobs(category.id));
  },

  /** POST /admin/job-categories — slug tự sinh từ name, không nhận từ client. */
  async create(actingUserId: string, body: CreateBody) {
    const existing = await repo().findOneBy({ name: body.name });
    if (existing) {
      throw new AppError(409, "CONFLICT", "Tên ngành nghề đã tồn tại");
    }

    const category = repo().create({
      name: body.name,
      slug: slugify(body.name),
      description: body.description ?? null,
      status: JOB_CATEGORY_STATUS.ACTIVE,
    });

    try {
      await repo().save(category);
    } catch (error) {
      // 23505 = trùng UNIQUE (name đã check ở trên, đây là phòng khi 2 name khác nhau
      // tạo ra cùng 1 slug sau khi bỏ dấu — hiếm nhưng vẫn phải chặn đẹp thay vì 500).
      if ((error as { code?: string }).code === "23505") {
        throw new AppError(409, "CONFLICT", "Tên ngành nghề đã tồn tại");
      }
      throw error;
    }

    await logService.write({
      userId: actingUserId,
      action: "CREATE_JOB_CATEGORY",
      target: { type: "JOB_CATEGORY", id: category.id },
      oldValue: null,
      newValue: category.name,
    });

    return toItem(category, 0);
  },

  /** PUT /admin/job-categories/{id} — đổi `name` thì `slug` tự tính lại theo name mới. */
  async update(actingUserId: string, id: string, body: UpdateBody) {
    return AppDataSource.transaction(async (manager) => {
      const categoryRepo = manager.getRepository(JobCategory);
      const category = await categoryRepo.findOneBy({ id });
      if (!category) {
        throw new AppError(404, "NOT_FOUND", "Không tìm thấy ngành nghề");
      }

      if (body.name && body.name !== category.name) {
        const existing = await categoryRepo.findOneBy({ name: body.name });
        if (existing && existing.id !== category.id) {
          throw new AppError(409, "CONFLICT", "Tên ngành nghề đã tồn tại");
        }
      }

      const oldValue = JSON.stringify({ name: category.name, status: category.status });

      if (body.name) {
        category.name = body.name;
        category.slug = slugify(body.name);
      }
      if (body.description !== undefined) {
        category.description = body.description;
      }
      if (body.status) {
        category.status = body.status as JobCategoryStatusValue;
      }

      try {
        await categoryRepo.save(category);
      } catch (error) {
        if ((error as { code?: string }).code === "23505") {
          throw new AppError(409, "CONFLICT", "Tên ngành nghề đã tồn tại");
        }
        throw error;
      }

      const newValue = JSON.stringify({ name: category.name, status: category.status });

      await logService.write(
        {
          userId: actingUserId,
          action: "UPDATE_JOB_CATEGORY",
          target: { type: "JOB_CATEGORY", id: category.id },
          oldValue,
          newValue,
        },
        manager,
      );

      return toItem(category, await countActiveJobs(category.id));
    });
  },

  /**
   * DELETE /admin/job-categories/{id} — xóa cứng thật, không xóa mềm (status đã đảm
   * nhiệm việc "vô hiệu hóa"). `fk_jobs_category` là ON DELETE RESTRICT nên phải tự
   * check trước để trả lỗi rõ ràng; đếm bằng `withDeleted: true` vì ràng buộc FK ở DB
   * không quan tâm job đã bị xóa mềm hay chưa — dòng vẫn còn tồn tại trong bảng `jobs`.
   */
  async remove(actingUserId: string, id: string): Promise<void> {
    const category = await repo().findOneBy({ id });
    if (!category) {
      throw new AppError(404, "NOT_FOUND", "Không tìm thấy ngành nghề");
    }

    const referencingJobs = await jobRepo().count({
      where: { categoryId: id },
      withDeleted: true,
    });
    if (referencingJobs > 0) {
      throw new AppError(
        409,
        "CONFLICT",
        `Không thể xóa: đang có ${referencingJobs} tin tuyển dụng thuộc ngành nghề này`,
      );
    }

    await repo().remove(category);

    await logService.write({
      userId: actingUserId,
      action: "DELETE_JOB_CATEGORY",
      target: { type: "JOB_CATEGORY", id },
      oldValue: category.name,
      newValue: null,
    });
  },
};
