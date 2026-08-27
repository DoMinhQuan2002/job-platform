export type JobSort = "newest" | "deadline_asc" | "salary_asc" | "salary_desc";

export type JobCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type JobFilters = {
  keyword: string;
  companyId?: string;
  location: string;
  categoryId: string;
  jobMode: string;
  jobType: string;
  minSalary: string;
  maxSalary: string;
  maxExperience: string;
  sort: JobSort;
  page: number;
  size: number;
};

export type Job = {
  id: string;
  title: string;
  slug: string;
  address: string;
  salaryMin: string | null;
  salaryMax: string | null;
  isNegotiable: boolean;
  experience: number | null;
  jobType: string;
  jobMode: string;
  createdAt: string;
  company: { id: string; name: string; logo: string | null };
  category: { id: string; name: string };
  jobSkills: Array<{ id: string; skill: { id: string; name: string } }>;
};

export type JobsResponse = {
  success: boolean;
  data: Job[];
  pagination: { page: number; size: number; total: number; totalPages: number };
};

export type JobCategoriesResponse = {
  success: boolean;
  message?: string;
  data: JobCategory[];
};
