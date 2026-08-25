import { Brackets, In } from "typeorm";
import { AppError } from "../../common/errors/app-error";
import {
  JOB_CATEGORY_STATUS,
  JOB_MODE,
  JOB_STATUS,
  JOB_TYPE,
  type JobModeValue,
  type JobTypeValue,
} from "../../common/constants/job";
import { AppDataSource } from "../../data-source";
import { Company } from "../../database/entities/company.entity";
import { JobCategory } from "../../database/entities/job-category.entity";
import { JobSkill } from "../../database/entities/job-skill.entity";
import { Job } from "../../database/entities/job.entity";
import { SkillEntity } from "../../database/entities/skill.entity";
import type {
  CreateJobInput,
  CurrentUser,
  JobQuery,
  JobSkillInput,
  RecruiterJobsQuery,
  UpdateJobInput,
  UpdateJobStatusInput,
} from "./dto";

// Re-export để giữ tương thích với các module đã import type từ jobs.service.
export type {
  CreateJobInput,
  CurrentUser,
  JobQuery,
  JobSkillInput,
  RecruiterJobsQuery,
  UpdateJobInput,
  UpdateJobStatusInput,
} from "./dto";

// Các relation dùng chung khi trả thông tin đầy đủ của một job.
const jobRelations = ["company", "category", "jobSkills", "jobSkills.skill"];

// Lấy repository tại thời điểm gọi để tránh truy cập trước khi DataSource khởi tạo.
const getJobRepository = () => AppDataSource.getRepository(Job);
const getCompanyRepository = () => AppDataSource.getRepository(Company);
const getCategoryRepository = () => AppDataSource.getRepository(JobCategory);
const getSkillRepository = () => AppDataSource.getRepository(SkillEntity);

// Chuẩn hóa trường text bắt buộc và loại bỏ giá trị chỉ chứa khoảng trắng.
const requireNonEmpty = (value: string, field: string) => {
  const normalized = value.trim();
  if (!normalized) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} không được để trống.`);
  }
  return normalized;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Slug sau khi chuẩn hóa phải còn ít nhất một ký tự hợp lệ.
const normalizeSlug = (value: string) => {
  const slug = slugify(value);
  if (!slug) {
    throw new AppError(400, "INVALID_SLUG", "Slug không hợp lệ.");
  }
  return slug;
};

const normalizeSalary = (
  value: number | string | null | undefined,
  field: "salaryMin" | "salaryMax",
): string | null => {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new AppError(400, "INVALID_SALARY", `${field} phải là số lớn hơn hoặc bằng 0.`);
  }
  return parsed.toFixed(2);
};

// Chuẩn hóa decimal thành chuỗi để tương thích kiểu numeric/decimal của PostgreSQL.
const normalizeSalaryRange = (
  salaryMin: number | string | null | undefined,
  salaryMax: number | string | null | undefined,
) => {
  const min = normalizeSalary(salaryMin, "salaryMin");
  const max = normalizeSalary(salaryMax, "salaryMax");

  if (min !== null && max !== null && Number(min) > Number(max)) {
    throw new AppError(
      400,
      "INVALID_SALARY_RANGE",
      "salaryMax phải lớn hơn hoặc bằng salaryMin.",
    );
  }
  return { min, max };
};

const validateExperience = (experience: number | null | undefined) => {
  if (
    experience !== undefined &&
    experience !== null &&
    (!Number.isInteger(experience) || experience < 0)
  ) {
    throw new AppError(
      400,
      "INVALID_EXPERIENCE",
      "Kinh nghiệm phải là số nguyên lớn hơn hoặc bằng 0.",
    );
  }
};

const validateQuantity = (quantity: number | undefined) => {
  if (quantity !== undefined && (!Number.isInteger(quantity) || quantity <= 0)) {
    throw new AppError(
      400,
      "INVALID_QUANTITY",
      "Số lượng tuyển phải là số nguyên lớn hơn 0.",
    );
  }
};

const validateJobOptions = (input: {
  jobType?: JobTypeValue;
  jobMode?: JobModeValue;
  isNegotiable?: boolean;
}) => {
  if (input.jobType !== undefined && !Object.values(JOB_TYPE).includes(input.jobType)) {
    throw new AppError(400, "INVALID_JOB_TYPE", "Loại việc làm không hợp lệ.");
  }
  if (input.jobMode !== undefined && !Object.values(JOB_MODE).includes(input.jobMode)) {
    throw new AppError(400, "INVALID_JOB_MODE", "Hình thức làm việc không hợp lệ.");
  }
  if (input.isNegotiable !== undefined && typeof input.isNegotiable !== "boolean") {
    throw new AppError(400, "INVALID_IS_NEGOTIABLE", "isNegotiable phải là boolean.");
  }
};

// Parse nghiêm ngặt YYYY-MM-DD để tránh JavaScript tự điều chỉnh ngày sai.
const parseDeadline = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new AppError(400, "INVALID_DEADLINE", "Hạn ứng tuyển phải có định dạng YYYY-MM-DD.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const deadline = new Date(year, month - 1, day);

  if (
    deadline.getFullYear() !== year ||
    deadline.getMonth() !== month - 1 ||
    deadline.getDate() !== day
  ) {
    throw new AppError(400, "INVALID_DEADLINE", "Hạn ứng tuyển không hợp lệ.");
  }

  deadline.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (deadline < today) {
    throw new AppError(
      400,
      "DEADLINE_IN_PAST",
      "Hạn ứng tuyển không được nhỏ hơn ngày hiện tại.",
    );
  }
  return deadline;
};

// Chỉ recruiter sở hữu công ty hoặc admin mới được quản lý tin của công ty.
const validateCompanyAccess = async (companyId: string, currentUser: CurrentUser) => {
  if (currentUser.role !== "RECRUITER" && currentUser.role !== "ADMIN") {
    throw new AppError(403, "FORBIDDEN", "Bạn không có quyền quản lý tin tuyển dụng.");
  }

  const company = await getCompanyRepository().findOne({ where: { id: companyId } });
  if (!company) {
    throw new AppError(404, "COMPANY_NOT_FOUND", "Công ty không tồn tại.");
  }
  if (company.status !== "ACTIVE") {
    throw new AppError(403, "COMPANY_BLOCKED", "Công ty hiện đang bị khóa.");
  }
  if (currentUser.role !== "ADMIN" && company.userId !== currentUser.id) {
    throw new AppError(403, "COMPANY_ACCESS_DENIED", "Bạn không có quyền quản lý công ty này.");
  }
  return company;
};

// Job chỉ được gắn vào danh mục đang hoạt động.
const validateCategory = async (categoryId: string) => {
  const category = await getCategoryRepository().findOne({ where: { id: categoryId } });
  if (!category) {
    throw new AppError(404, "CATEGORY_NOT_FOUND", "Danh mục việc làm không tồn tại.");
  }
  if (category.status !== JOB_CATEGORY_STATUS.ACTIVE) {
    throw new AppError(400, "CATEGORY_INACTIVE", "Danh mục việc làm không hoạt động.");
  }
};

// Không cho phép skill trùng, không tồn tại hoặc đã ngừng hoạt động.
const validateSkills = async (skills: JobSkillInput[]) => {
  if (skills.some(({ isRequired }) => isRequired !== undefined && typeof isRequired !== "boolean")) {
    throw new AppError(400, "INVALID_IS_REQUIRED", "isRequired phải là boolean.");
  }
  const ids = skills.map(({ skillId }) => skillId);
  const uniqueIds = [...new Set(ids)];
  if (ids.length !== uniqueIds.length) {
    throw new AppError(400, "DUPLICATE_SKILL", "Một kỹ năng không được xuất hiện nhiều lần.");
  }
  if (!uniqueIds.length) return;

  const existing = await getSkillRepository().find({
    where: { id: In(uniqueIds), status: "ACTIVE" },
  });
  const existingIds = new Set(existing.map(({ id }) => id));
  const missingIds = uniqueIds.filter((id) => !existingIds.has(id));
  if (missingIds.length) {
    throw new AppError(
      404,
      "SKILL_NOT_FOUND",
      "Có kỹ năng không tồn tại hoặc không hoạt động.",
      { skillIds: missingIds },
    );
  }
};

const serializeRecruiterJob = (job: Job) => ({
  id: job.id,
  title: job.title,
  slug: job.slug,
  salaryMin: job.salaryMin === null ? null : Number(job.salaryMin),
  salaryMax: job.salaryMax === null ? null : Number(job.salaryMax),
  isNegotiable: job.isNegotiable,
  address: job.address,
  jobType: job.jobType,
  jobMode: job.jobMode,
  experience: job.experience,
  quantity: job.quantity,
  deadline: job.deadline,
  status: job.status,
  rejectReason: job.rejectReason,
  category: job.category
    ? {
        id: job.category.id,
        name: job.category.name,
        slug: job.category.slug,
      }
    : null,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
});

export const jobService = {
  /** Tạo tin tuyển dụng và danh sách skill trong cùng một transaction. */
  async createJob(input: CreateJobInput, currentUser: CurrentUser) {
    const title = requireNonEmpty(input.title, "title");
    const description = requireNonEmpty(input.description, "description");
    const requirements = requireNonEmpty(input.requirements, "requirements");
    const address = requireNonEmpty(input.address, "address");
    const slug = normalizeSlug(input.slug ?? title);
    const salary = normalizeSalaryRange(input.salaryMin, input.salaryMax);
    const deadline = parseDeadline(input.deadline);
    const skills = input.skills ?? [];

    validateExperience(input.experience);
    validateQuantity(input.quantity);
    validateJobOptions(input);
    await Promise.all([
      validateCompanyAccess(input.companyId, currentUser),
      validateCategory(input.categoryId),
      validateSkills(skills),
    ]);

    // Transaction bảo đảm không tạo job nếu quá trình lưu job-skills thất bại.
    const result = await AppDataSource.transaction(async (manager) => {
      const jobs = manager.getRepository(Job);
      const jobSkills = manager.getRepository(JobSkill);
      const job = jobs.create({
        companyId: input.companyId,
        categoryId: input.categoryId,
        title,
        slug,
        description,
        requirements,
        benefits: input.benefits?.trim() || null,
        salaryMin: salary.min,
        salaryMax: salary.max,
        isNegotiable: input.isNegotiable ?? false,
        address,
        jobType: input.jobType,
        jobMode: input.jobMode ?? JOB_MODE.ONSITE,
        experience: input.experience ?? null,
        quantity: input.quantity ?? 1,
        deadline,
        rejectReason: null,
        status: JOB_STATUS.PENDING,
      });
      const saved = await jobs.save(job);

      if (skills.length) {
        await jobSkills.save(
          skills.map((skill) =>
            jobSkills.create({
              jobId: saved.id,
              skillId: skill.skillId,
              isRequired: skill.isRequired ?? true,
            }),
          ),
        );
      }
      return jobs.findOne({ where: { id: saved.id }, relations: jobRelations });
    });

    if (!result) {
      throw new AppError(500, "JOB_CREATE_FAILED", "Không thể lấy tin vừa tạo.");
    }
    return result;
  },

  /** Lấy danh sách job công khai, còn hạn với bộ lọc và phân trang. */
  async getJobs(query: JobQuery) {
    const page = Number.isInteger(query.page) && (query.page as number) > 0 ? (query.page as number) : 1;
    const requestedSize =
      Number.isInteger(query.size) && (query.size as number) > 0 ? (query.size as number) : 20;
    const size = Math.min(requestedSize, 100);
    const qb = getJobRepository()
      .createQueryBuilder("job")
      .leftJoinAndSelect("job.company", "company")
      .leftJoinAndSelect("job.category", "category")
      .leftJoinAndSelect("job.jobSkills", "jobSkill")
      .leftJoinAndSelect("jobSkill.skill", "skill")
      .where("job.status = :status", { status: JOB_STATUS.APPROVED })
      .andWhere("job.deadline >= CURRENT_DATE");

    if (query.keyword?.trim()) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where("job.title ILIKE :keyword", { keyword: `%${query.keyword!.trim()}%` })
            .orWhere("company.name ILIKE :keyword", { keyword: `%${query.keyword!.trim()}%` })
            .orWhere("job.description ILIKE :keyword", { keyword: `%${query.keyword!.trim()}%` });
        }),
      );
    }
    if (query.categoryId) qb.andWhere("job.categoryId = :categoryId", { categoryId: query.categoryId });
    if (query.location?.trim()) {
      qb.andWhere("job.address ILIKE :location", { location: `%${query.location.trim()}%` });
    }
    if (query.jobType) qb.andWhere("job.jobType = :jobType", { jobType: query.jobType });
    if (query.jobMode) qb.andWhere("job.jobMode = :jobMode", { jobMode: query.jobMode });
    if (query.maxExperience !== undefined) {
      qb.andWhere("(job.experience IS NULL OR job.experience <= :maxExperience)", {
        maxExperience: query.maxExperience,
      });
    }
    if (query.minSalary !== undefined) {
      qb.andWhere("(job.isNegotiable = true OR job.salaryMax >= :minSalary)", {
        minSalary: query.minSalary,
      });
    }
    if (query.maxSalary !== undefined) {
      qb.andWhere("(job.isNegotiable = true OR job.salaryMin <= :maxSalary)", {
        maxSalary: query.maxSalary,
      });
    }
    if (query.skillId) {
      // EXISTS chỉ dùng để lọc; relation jobSkills trả về vẫn giữ đầy đủ skills.
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM job_skills filter_job_skill
          WHERE filter_job_skill.job_id = job.id
            AND filter_job_skill.skill_id = :skillId
        )`,
        { skillId: query.skillId },
      );
    }

    switch (query.sort) {
      case "deadline_asc":
        qb.orderBy("job.deadline", "ASC");
        break;
      case "salary_asc":
        qb.orderBy("job.salaryMin", "ASC", "NULLS LAST");
        break;
      case "salary_desc":
        qb.orderBy("job.salaryMax", "DESC", "NULLS LAST");
        break;
      default:
        qb.orderBy("job.createdAt", "DESC");
    }

    const [items, total] = await qb.skip((page - 1) * size).take(size).getManyAndCount();
    return { items, pagination: { page, size, total, totalPages: Math.ceil(total / size) } };
  },

  /** Lấy chi tiết một job đã duyệt và chưa hết hạn. */
  async getJobById(id: string) {
    const job = await getJobRepository()
      .createQueryBuilder("job")
      .leftJoinAndSelect("job.company", "company")
      .leftJoinAndSelect("job.category", "category")
      .leftJoinAndSelect("job.jobSkills", "jobSkill")
      .leftJoinAndSelect("jobSkill.skill", "skill")
      .where("job.id = :id", { id })
      .andWhere("job.status = :status", { status: JOB_STATUS.APPROVED })
      .andWhere("job.deadline >= CURRENT_DATE")
      .getOne();

    if (!job) {
      throw new AppError(
        404,
        "JOB_NOT_FOUND",
        "Tin tuyển dụng không tồn tại hoặc không còn được công khai.",
      );
    }
    return job;
  },

  /** Cập nhật job thuộc quyền quản lý của recruiter hoặc admin. */
  async updateJob(id: string, input: UpdateJobInput, currentUser: CurrentUser) {
    if (Object.keys(input).length === 0) {
      throw new AppError(400, "EMPTY_UPDATE", "Không có dữ liệu cần cập nhật.");
    }
    const job = await getJobRepository().findOne({ where: { id }, relations: ["company"] });
    if (!job) throw new AppError(404, "JOB_NOT_FOUND", "Tin tuyển dụng không tồn tại.");
    if (currentUser.role !== "ADMIN" && job.company.userId !== currentUser.id) {
      throw new AppError(403, "JOB_ACCESS_DENIED", "Bạn không có quyền cập nhật tin này.");
    }
    if (currentUser.role !== "RECRUITER" && currentUser.role !== "ADMIN") {
      throw new AppError(403, "FORBIDDEN", "Bạn không có quyền cập nhật tin tuyển dụng.");
    }
    if (job.status === JOB_STATUS.CLOSED) {
      throw new AppError(400, "JOB_ALREADY_CLOSED", "Tin tuyển dụng đã đóng.");
    }

    if (input.categoryId !== undefined) await validateCategory(input.categoryId);
    if (input.skills !== undefined) await validateSkills(input.skills);
    validateExperience(input.experience);
    validateQuantity(input.quantity);
    validateJobOptions(input);

    const salary = normalizeSalaryRange(
      input.salaryMin === undefined ? job.salaryMin : input.salaryMin,
      input.salaryMax === undefined ? job.salaryMax : input.salaryMax,
    );
    const deadline = input.deadline === undefined ? job.deadline : parseDeadline(input.deadline);

    const result = await AppDataSource.transaction(async (manager) => {
      const jobs = manager.getRepository(Job);
      const jobSkills = manager.getRepository(JobSkill);

      if (input.categoryId !== undefined) job.categoryId = input.categoryId;
      if (input.title !== undefined) job.title = requireNonEmpty(input.title, "title");
      if (input.slug !== undefined) job.slug = normalizeSlug(input.slug);
      else if (input.title !== undefined) job.slug = normalizeSlug(input.title);
      if (input.description !== undefined) {
        job.description = requireNonEmpty(input.description, "description");
      }
      if (input.requirements !== undefined) {
        job.requirements = requireNonEmpty(input.requirements, "requirements");
      }
      if (input.benefits !== undefined) job.benefits = input.benefits?.trim() || null;
      if (input.salaryMin !== undefined) job.salaryMin = salary.min;
      if (input.salaryMax !== undefined) job.salaryMax = salary.max;
      if (input.isNegotiable !== undefined) job.isNegotiable = input.isNegotiable;
      if (input.address !== undefined) job.address = requireNonEmpty(input.address, "address");
      if (input.jobType !== undefined) job.jobType = input.jobType;
      if (input.jobMode !== undefined) job.jobMode = input.jobMode;
      if (input.experience !== undefined) job.experience = input.experience;
      if (input.quantity !== undefined) job.quantity = input.quantity;
      job.deadline = deadline;

      // Nội dung đã công khai hoặc từng bị từ chối phải được admin duyệt lại.
      if (job.status === JOB_STATUS.APPROVED || job.status === JOB_STATUS.REJECTED) {
        job.status = JOB_STATUS.PENDING;
        job.rejectReason = null;
      }
      await jobs.save(job);

      if (input.skills !== undefined) {
        // Có trường skills nghĩa là thay thế toàn bộ; không truyền thì giữ nguyên.
        await jobSkills.delete({ jobId: id });
        if (input.skills.length) {
          await jobSkills.save(
            input.skills.map((skill) =>
              jobSkills.create({
                jobId: id,
                skillId: skill.skillId,
                isRequired: skill.isRequired ?? true,
              }),
            ),
          );
        }
      }
      return jobs.findOne({ where: { id }, relations: jobRelations });
    });

    if (!result) throw new AppError(500, "JOB_UPDATE_FAILED", "Không thể lấy tin sau cập nhật.");
    return result;
  },

  /** GET /jobs/job-categories - Danh sách danh mục việc làm đang hoạt động. */
  async getActiveJobCategories() {
    const categories = await getCategoryRepository().find({
      where: { status: JOB_CATEGORY_STATUS.ACTIVE },
      order: { name: "ASC" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    });

    return categories;
  },

  async listRecruiterJobs(currentUser: CurrentUser, query: RecruiterJobsQuery) {
    if (currentUser.role !== "RECRUITER") {
      throw new AppError(403, "FORBIDDEN", "Chỉ nhà tuyển dụng mới có quyền xem danh sách tin này.");
    }

    const company = await getCompanyRepository().findOneBy({ userId: currentUser.id });
    if (!company) {
      throw new AppError(404, "COMPANY_NOT_FOUND", "Nhà tuyển dụng chưa khởi tạo hồ sơ công ty.");
    }

    const queryBuilder = getJobRepository()
      .createQueryBuilder("job")
      .innerJoinAndSelect("job.category", "category")
      .where("job.companyId = :companyId", { companyId: company.id });

    if (query.keyword) {
      queryBuilder.andWhere(
        new Brackets((sub) => {
          sub
            .where("job.title ILIKE :keyword", { keyword: `%${query.keyword}%` })
            .orWhere("job.description ILIKE :keyword", { keyword: `%${query.keyword}%` })
            .orWhere("job.requirements ILIKE :keyword", { keyword: `%${query.keyword}%` });
        }),
      );
    }

    if (query.status) {
      queryBuilder.andWhere("job.status = :status", { status: query.status });
    }

    if (query.category) {
      queryBuilder.andWhere("job.categoryId = :categoryId", { categoryId: query.category });
    }

    const [jobs, totalItems] = await queryBuilder
      .orderBy("job.createdAt", "DESC")
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return {
      items: jobs.map(serializeRecruiterJob),
      pagination: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
      },
    };
  },
  async updateJobStatus(currentUser: CurrentUser, id: string, input: UpdateJobStatusInput) {
    if (currentUser.role !== "RECRUITER") {
      throw new AppError(403, "FORBIDDEN", "Chỉ nhà tuyển dụng mới có quyền cập nhật trạng thái job.");
    }

    const company = await getCompanyRepository().findOneBy({ userId: currentUser.id });
    if (!company) {
      throw new AppError(404, "COMPANY_NOT_FOUND", "Nhà tuyển dụng chưa khởi tạo hồ sơ công ty.");
    }

    const job = await getJobRepository().findOneBy({ id });
    if (!job) {
      throw new AppError(404, "JOB_NOT_FOUND", "Tin tuyển dụng không tồn tại.");
    }

    if (job.companyId !== company.id) {
      throw new AppError(403, "JOB_ACCESS_DENIED", "Bạn không có quyền cập nhật tin này.");
    }

    if (company.status !== "ACTIVE") {
      throw new AppError(403, "COMPANY_BLOCKED", "Công ty hiện đang bị khóa.");
    }

    if (job.status === input.status) {
      throw new AppError(400, "INVALID_STATUS_TRANSITION", "Tin tuyển dụng đã ở trạng thái này.");
    }

    job.status = input.status;
    job.rejectReason = null;

    const updatedJob = await getJobRepository().save(job);

    return {
      id: updatedJob.id,
      status: updatedJob.status,
      updatedAt: updatedJob.updatedAt,
    };
  },
};
