import { z } from "zod";
import { JOB_STATUS, type JobModeValue, type JobTypeValue } from "../../../common/constants/job";
import type { RoleValue } from "../../../common/constants/roles";

/** Kỹ năng được gắn vào một tin tuyển dụng. */
export interface JobSkillInput {
  skillId: string;
  isRequired?: boolean;
}

/** Dữ liệu đã được controller chuẩn hóa trước khi tạo job. */
export interface CreateJobInput {
  companyId: string;
  categoryId: string;
  title: string;
  slug?: string;
  description: string;
  requirements: string;
  benefits?: string | null;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  isNegotiable?: boolean;
  address: string;
  jobType: JobTypeValue;
  jobMode?: JobModeValue;
  experience?: number | null;
  quantity?: number;
  deadline: string;
  skills?: JobSkillInput[];
}

/** Các trường được phép thay đổi trên một job. */
export interface UpdateJobInput {
  categoryId?: string;
  title?: string;
  slug?: string;
  description?: string;
  requirements?: string;
  benefits?: string | null;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  isNegotiable?: boolean;
  address?: string;
  jobType?: JobTypeValue;
  jobMode?: JobModeValue;
  experience?: number | null;
  quantity?: number;
  deadline?: string;
  skills?: JobSkillInput[];
}

/** Bộ lọc và phân trang cho danh sách job công khai. */
export interface JobQuery {
  keyword?: string;
  categoryId?: string;
  location?: string;
  jobType?: JobTypeValue;
  jobMode?: JobModeValue;
  minSalary?: number;
  maxSalary?: number;
  maxExperience?: number;
  skillId?: string;
  page?: number;
  size?: number;
  sort?: "newest" | "deadline_asc" | "salary_asc" | "salary_desc";
}

export const recruiterJobsQuerySchema = z.object({
  keyword: z.string().trim().optional(),
  status: z
    .enum(
      [
        JOB_STATUS.PENDING,
        JOB_STATUS.APPROVED,
        JOB_STATUS.REJECTED,
        JOB_STATUS.CLOSED,
      ],
      { error: "Trạng thái tin tuyển dụng không hợp lệ" }
    )
    .optional(),
  category: z
    .string()
    .trim()
    .regex(/^\d+$/, "category phải là số nguyên dương")
    .refine((id) => BigInt(id) > 0n, "category phải là số nguyên dương")
    .optional(),
  page: z.coerce
    .number({ error: "page phải là số nguyên hợp lệ" })
    .int("page phải là số nguyên")
    .min(1, "page phải lớn hơn hoặc bằng 1")
    .default(1),
  limit: z.coerce
    .number({ error: "limit phải là số nguyên hợp lệ" })
    .int("limit phải là số nguyên")
    .min(1, "limit phải lớn hơn hoặc bằng 1")
    .max(100, "limit tối đa là 100")
    .default(10),
});

export type RecruiterJobsQuery = z.infer<typeof recruiterJobsQuerySchema>;

export const updateJobStatusSchema = z
  .object({
    status: z.enum([JOB_STATUS.OPEN, JOB_STATUS.CLOSED, JOB_STATUS.HIDDEN, JOB_STATUS.APPROVED], {
      error: "Recruiter chỉ được cập nhật trạng thái OPEN, CLOSED hoặc HIDDEN",
    }),
  })
  .strict();

export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>;

/** Contract user do middleware xác thực gắn vào request. */
export interface CurrentUser {
  id: string;
  role: RoleValue;
}
