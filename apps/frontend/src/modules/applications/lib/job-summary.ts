type JobLike = Record<string, unknown>;

function asRecord(value: unknown): JobLike {
  return typeof value === "object" && value !== null ? (value as JobLike) : {};
}

function formatSalary(job: JobLike): string {
  if (typeof job.salary === "string" && job.salary.trim()) return job.salary;
  const min = job.salaryMin ?? job.salary_min;
  const max = job.salaryMax ?? job.salary_max;
  if (min != null || max != null) {
    const fmt = (n: unknown) =>
      typeof n === "number" ? `${Math.round(n / 1_000_000)}` : String(n ?? "");
    if (min != null && max != null) return `${fmt(min)} - ${fmt(max)} triệu VND`;
    if (min != null) return `Từ ${fmt(min)} triệu VND`;
    if (max != null) return `Đến ${fmt(max)} triệu VND`;
  }
  return "Thỏa thuận";
}

export type JobSummary = {
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  companyWebsite?: string;
  location: string;
  experience: string;
  salary: string;
  category: string;
  jobType: string;
  workplaceType: string;
  deadline: string;
  postedDate: string;
};

export function summarizeJob(raw: unknown): JobSummary {
  const job = asRecord(raw);
  const company = asRecord(job.company);
  const category = asRecord(job.category);

  return {
    title: String(job.title || "Tin tuyển dụng"),
    companyName: String(company.name || job.companyName || "Nhà tuyển dụng"),
    companyLogoUrl:
      (company.logoUrl as string | undefined) ||
      (company.logo_url as string | undefined) ||
      undefined,
    companyWebsite: (company.website as string | undefined) || undefined,
    location: String(job.location || company.address || "Toàn quốc"),
    experience: String(job.experience || "Không yêu cầu"),
    salary: formatSalary(job),
    category: String(category.name || job.categoryName || "Tuyển dụng"),
    jobType: String(job.jobType || job.employmentType || "Toàn thời gian"),
    workplaceType: String(job.workplaceType || job.workType || "—"),
    deadline: job.deadline ? String(job.deadline) : "—",
    postedDate: job.createdAt
      ? new Date(String(job.createdAt)).toLocaleDateString("vi-VN")
      : "—",
  };
}
