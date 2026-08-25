import type { JobModeValue, JobTypeValue } from "../../../common/constants/job";
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

/** Contract user do middleware xác thực gắn vào request. */
export interface CurrentUser {
  id: string;
  role: RoleValue;
}
