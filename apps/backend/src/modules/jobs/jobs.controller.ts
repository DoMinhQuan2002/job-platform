import type { NextFunction, Request, Response } from "express";
import { JOB_MODE, JOB_TYPE, type JobModeValue, type JobTypeValue } from "../../common/constants/job";
import { AppError } from "../../common/errors/app-error";
import { jobService } from "./jobs.service";
import { recruiterJobsQuerySchema, updateJobStatusSchema } from "./dto/jobs.dto";
import type {
  CreateJobInput,
  CurrentUser,
  JobQuery,
  JobSkillInput,
  UpdateJobInput,
} from "./dto";

const SORT_VALUES: NonNullable<JobQuery["sort"]>[] = [
  "newest",
  "deadline_asc",
  "salary_asc",
  "salary_desc",
];

// BIGINT được PostgreSQL/TypeORM trả về dưới dạng string để không mất độ chính xác.
const parseBigIntId = (value: unknown, field: string) => {
  const id = String(value ?? "").trim();
  if (!/^\d+$/.test(id) || BigInt(id) <= 0n) {
    throw new AppError(400, "INVALID_ID", `${field} không hợp lệ.`);
  }
  return id;
};

const parseRequiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} là bắt buộc.`);
  }
  return value;
};

const parseOptionalString = (value: unknown, field: string) => {
  if (typeof value !== "string") {
    throw new AppError(400, "VALIDATION_ERROR", `${field} phải là chuỗi.`);
  }
  return value;
};

const parseNullableString = (value: unknown, field: string) => {
  if (value === null) return null;
  return parseOptionalString(value, field);
};

const parseNumber = (value: unknown, field: string) => {
  if (value === "" || value === null || value === undefined) {
    throw new AppError(400, "INVALID_NUMBER", `${field} phải là số.`);
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new AppError(400, "INVALID_NUMBER", `${field} phải là số hữu hạn.`);
  }
  return parsed;
};

const parseNonNegativeNumber = (value: unknown, field: string) => {
  const parsed = parseNumber(value, field);
  if (parsed < 0) {
    throw new AppError(400, "INVALID_NUMBER", `${field} phải lớn hơn hoặc bằng 0.`);
  }
  return parsed;
};

const parsePositiveInteger = (value: unknown, field: string) => {
  const parsed = parseNumber(value, field);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(400, "INVALID_NUMBER", `${field} phải là số nguyên lớn hơn 0.`);
  }
  return parsed;
};

const parseBoolean = (value: unknown, field: string) => {
  if (typeof value !== "boolean") {
    throw new AppError(400, "INVALID_BOOLEAN", `${field} phải là boolean.`);
  }
  return value;
};

const parseJobType = (value: unknown): JobTypeValue => {
  if (!Object.values(JOB_TYPE).includes(value as JobTypeValue)) {
    throw new AppError(400, "INVALID_JOB_TYPE", "Loại việc làm không hợp lệ.");
  }
  return value as JobTypeValue;
};

const parseJobMode = (value: unknown): JobModeValue => {
  if (!Object.values(JOB_MODE).includes(value as JobModeValue)) {
    throw new AppError(400, "INVALID_JOB_MODE", "Hình thức làm việc không hợp lệ.");
  }
  return value as JobModeValue;
};

const parseSkills = (value: unknown): JobSkillInput[] => {
  if (!Array.isArray(value)) {
    throw new AppError(400, "INVALID_SKILLS", "skills phải là một mảng.");
  }

  return value.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new AppError(400, "INVALID_SKILL", `skills[${index}] không hợp lệ.`);
    }
    const skill = item as Record<string, unknown>;
    return {
      skillId: parseBigIntId(skill.skillId, `skills[${index}].skillId`),
      ...(skill.isRequired === undefined
        ? {}
        : { isRequired: parseBoolean(skill.isRequired, `skills[${index}].isRequired`) }),
    };
  });
};

// Dữ liệu này phải do middleware xác thực gắn vào req.user, không lấy từ body/header.
const requireCurrentUser = (req: Request): CurrentUser => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Bạn chưa đăng nhập.");
  }
  return { id: req.user.id, role: req.user.role };
};

const parseCreateInput = (body: Record<string, unknown>): CreateJobInput => ({
  companyId: parseBigIntId(body.companyId, "companyId"),
  categoryId: parseBigIntId(body.categoryId, "categoryId"),
  title: parseRequiredString(body.title, "title"),
  ...(body.slug === undefined ? {} : { slug: parseOptionalString(body.slug, "slug") }),
  description: parseRequiredString(body.description, "description"),
  requirements: parseRequiredString(body.requirements, "requirements"),
  ...(body.benefits === undefined
    ? {}
    : { benefits: parseNullableString(body.benefits, "benefits") }),
  ...(body.salaryMin === undefined ? {} : { salaryMin: body.salaryMin as number | string | null }),
  ...(body.salaryMax === undefined ? {} : { salaryMax: body.salaryMax as number | string | null }),
  ...(body.isNegotiable === undefined
    ? {}
    : { isNegotiable: parseBoolean(body.isNegotiable, "isNegotiable") }),
  address: parseRequiredString(body.address, "address"),
  jobType: parseJobType(body.jobType),
  ...(body.jobMode === undefined ? {} : { jobMode: parseJobMode(body.jobMode) }),
  ...(body.experience === undefined
    ? {}
    : { experience: body.experience === null ? null : parseNumber(body.experience, "experience") }),
  ...(body.quantity === undefined ? {} : { quantity: parseNumber(body.quantity, "quantity") }),
  deadline: parseRequiredString(body.deadline, "deadline"),
  ...(body.skills === undefined ? {} : { skills: parseSkills(body.skills) }),
});

const parseUpdateInput = (body: Record<string, unknown>): UpdateJobInput => {
  const input: UpdateJobInput = {};
  if (body.categoryId !== undefined) input.categoryId = parseBigIntId(body.categoryId, "categoryId");
  if (body.title !== undefined) input.title = parseOptionalString(body.title, "title");
  if (body.slug !== undefined) input.slug = parseOptionalString(body.slug, "slug");
  if (body.description !== undefined) {
    input.description = parseOptionalString(body.description, "description");
  }
  if (body.requirements !== undefined) {
    input.requirements = parseOptionalString(body.requirements, "requirements");
  }
  if (body.benefits !== undefined) input.benefits = parseNullableString(body.benefits, "benefits");
  if (body.salaryMin !== undefined) input.salaryMin = body.salaryMin as number | string | null;
  if (body.salaryMax !== undefined) input.salaryMax = body.salaryMax as number | string | null;
  if (body.isNegotiable !== undefined) {
    input.isNegotiable = parseBoolean(body.isNegotiable, "isNegotiable");
  }
  if (body.address !== undefined) input.address = parseOptionalString(body.address, "address");
  if (body.jobType !== undefined) input.jobType = parseJobType(body.jobType);
  if (body.jobMode !== undefined) input.jobMode = parseJobMode(body.jobMode);
  if (body.experience !== undefined) {
    input.experience = body.experience === null ? null : parseNumber(body.experience, "experience");
  }
  if (body.quantity !== undefined) input.quantity = parseNumber(body.quantity, "quantity");
  if (body.deadline !== undefined) input.deadline = parseOptionalString(body.deadline, "deadline");
  if (body.skills !== undefined) input.skills = parseSkills(body.skills);
  return input;
};

const parseQuery = (query: Request["query"]): JobQuery => {
  const result: JobQuery = {};
  if (query.keyword !== undefined) result.keyword = parseOptionalString(query.keyword, "keyword");
  if (query.companyId !== undefined) {
    result.companyId = parseBigIntId(query.companyId, "companyId");
  } else if (query.company !== undefined) {
    result.companyId = parseBigIntId(query.company, "company");
  }
  if (query.categoryId !== undefined) {
    result.categoryId = parseBigIntId(query.categoryId, "categoryId");
  } else if (query.category !== undefined) {
    result.categoryId = parseBigIntId(query.category, "category");
  }
  if (query.location !== undefined) result.location = parseOptionalString(query.location, "location");
  if (query.jobType !== undefined) result.jobType = parseJobType(query.jobType);
  if (query.jobMode !== undefined) result.jobMode = parseJobMode(query.jobMode);
  if (query.minSalary !== undefined) {
    result.minSalary = parseNonNegativeNumber(query.minSalary, "minSalary");
  }
  if (query.maxSalary !== undefined) {
    result.maxSalary = parseNonNegativeNumber(query.maxSalary, "maxSalary");
  }
  if (query.maxExperience !== undefined) {
    result.maxExperience = parseNonNegativeNumber(query.maxExperience, "maxExperience");
  }
  if (query.skillId !== undefined) result.skillId = parseBigIntId(query.skillId, "skillId");
  if (query.page !== undefined) result.page = parsePositiveInteger(query.page, "page");
  if (query.size !== undefined) {
    result.size = parsePositiveInteger(query.size, "size");
  } else if (query.limit !== undefined) {
    result.size = parsePositiveInteger(query.limit, "limit");
  }
  if (query.sort !== undefined) {
    const sort = String(query.sort) as NonNullable<JobQuery["sort"]>;
    if (!SORT_VALUES.includes(sort)) {
      throw new AppError(400, "INVALID_SORT", "Kiểu sắp xếp không hợp lệ.");
    }
    result.sort = sort;
  }
  return result;
};

export const jobsController = {
  /** POST /jobs - yêu cầu middleware xác thực trước controller. */
  createJob: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCurrentUser(req);
      const data = await jobService.createJob(parseCreateInput(req.body), user);
      res.status(201).json({
        success: true,
        message: "Tạo tin tuyển dụng thành công. Tin đang chờ duyệt.",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /jobs - API public. */
  getJobs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await jobService.getJobs(parseQuery(req.query));
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /jobs/:id - API public. */
  getJobById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseBigIntId(req.params.id, "id");
      const data = await jobService.getJobById(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /** PUT /jobs/:id - yêu cầu middleware xác thực trước controller. */
  updateJob: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseBigIntId(req.params.id, "id");
      const user = requireCurrentUser(req);
      const data = await jobService.updateJob(id, parseUpdateInput(req.body), user);
      res.status(200).json({
        success: true,
        message: "Cập nhật tin tuyển dụng thành công.",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /jobs/job-categories - API public. */
  getJobCategories: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await jobService.getActiveJobCategories();

      res.status(200).json({
        success: true,
        message: "Lấy danh sách danh mục việc làm thành công.",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /recruiter/jobs - Danh sách job của recruiter đang đăng nhập. */
  getRecruiterJobs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCurrentUser(req);
      const parsed = recruiterJobsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        throw new AppError(
          400,
          "BAD_REQUEST",
          parsed.error.issues[0]?.message || "Tham số truy vấn không hợp lệ",
          errorMessages
        );
      }

      const data = await jobService.listRecruiterJobs(user, parsed.data);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách tin tuyển dụng thành công.",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /recruiter/jobs/:id - Chi tiết tin thuộc công ty của recruiter. */
  getRecruiterJobById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCurrentUser(req);
      const id = parseBigIntId(req.params.id, "id");
      const data = await jobService.getRecruiterJobById(user, id);

      res.status(200).json({
        success: true,
        message: "Lấy chi tiết tin tuyển dụng thành công.",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /jobs/:id - Recruiter cập nhật trạng thái job. */
  updateJobStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseBigIntId(req.params.id, "id");
      const user = requireCurrentUser(req);
      const parsed = updateJobStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        throw new AppError(
          400,
          "BAD_REQUEST",
          parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ",
          errorMessages
        );
      }

      const data = await jobService.updateJobStatus(user, id, parsed.data);

      res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái tin tuyển dụng thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
