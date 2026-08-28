type JobLike = Record<string, unknown>;

function asRecord(value: unknown): JobLike {
  return typeof value === "object" && value !== null ? (value as JobLike) : {};
}

function formatSalary(job: JobLike): string {
  if (job.isNegotiable === true) return "Thỏa thuận";
  if (typeof job.salary === "string" && job.salary.trim()) return job.salary;
  const min = job.salaryMin ?? job.salary_min;
  const max = job.salaryMax ?? job.salary_max;
  if (min != null || max != null) {
    const toMillion = (n: unknown) => {
      const num = typeof n === "number" ? n : Number(n);
      if (!Number.isFinite(num)) return String(n ?? "");
      if (num >= 1_000_000) return `${Math.round(num / 1_000_000)}`;
      return String(num);
    };
    if (min != null && max != null) return `${toMillion(min)} - ${toMillion(max)} triệu VND`;
    if (min != null) return `Từ ${toMillion(min)} triệu VND`;
    if (max != null) return `Đến ${toMillion(max)} triệu VND`;
  }
  return "Thỏa thuận";
}

function jobTypeLabel(value: unknown): string {
  const v = String(value || "");
  if (v === "FULL_TIME") return "Toàn thời gian";
  if (v === "PART_TIME") return "Bán thời gian";
  return v || "Toàn thời gian";
}

function workplaceLabel(value: unknown): string {
  const v = String(value || "");
  if (v === "ONSITE") return "Tại văn phòng";
  if (v === "REMOTE") return "Làm từ xa";
  if (v === "HYBRID") return "Hybrid";
  return v || "—";
}

function experienceLabel(value: unknown): string {
  if (value == null || value === "") return "Không yêu cầu";
  const n = Number(value);
  if (Number.isFinite(n)) {
    if (n <= 0) return "Không yêu cầu";
    return `${n} năm`;
  }
  return String(value);
}

function splitTextBlocks(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof value !== "string" || !value.trim()) return [];
  return value
    .split(/\r?\n|•|;/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export type JobSummary = {
  title: string;
  companyId?: string;
  companyName: string;
  companyLogoUrl?: string;
  companyWebsite?: string;
  companyAbout?: string;
  companySize?: string;
  companyAddress?: string;
  location: string;
  experience: string;
  salary: string;
  category: string;
  jobType: string;
  workplaceType: string;
  deadline: string;
  postedDate: string;
  quantity: string;
  description: string[];
  requirements: string[];
  benefits: string[];
  tags: string[];
  isSaved: boolean;
};

export function summarizeJob(raw: unknown): JobSummary {
  const job = asRecord(raw);
  const company = asRecord(job.company);
  const category = asRecord(job.category);
  const jobSkills = Array.isArray(job.jobSkills) ? job.jobSkills : [];
  const skillNames = jobSkills
    .map((row) => {
      const skill = asRecord(asRecord(row).skill);
      return String(skill.name || "").trim();
    })
    .filter(Boolean);

  const deadlineRaw = job.deadline;
  const deadline =
    deadlineRaw != null
      ? new Date(String(deadlineRaw)).toLocaleDateString("vi-VN")
      : "—";

  return {
    title: String(job.title || "Tin tuyển dụng"),
    companyId: company.id != null ? String(company.id) : undefined,
    companyName: String(company.name || job.companyName || "Nhà tuyển dụng"),
    companyLogoUrl:
      (company.logo as string | undefined) ||
      (company.logoUrl as string | undefined) ||
      (company.logo_url as string | undefined) ||
      undefined,
    companyWebsite: (company.website as string | undefined) || undefined,
    companyAbout: (company.description as string | undefined) || undefined,
    companySize: (company.companySize as string | undefined) || undefined,
    companyAddress: (company.address as string | undefined) || undefined,
    location: String(job.address || job.location || company.address || "Toàn quốc"),
    experience: experienceLabel(job.experience),
    salary: formatSalary(job),
    category: String(category.name || job.categoryName || "Tuyển dụng"),
    jobType: jobTypeLabel(job.jobType || job.employmentType),
    workplaceType: workplaceLabel(job.jobMode || job.workplaceType || job.workType),
    deadline,
    postedDate: job.createdAt
      ? new Date(String(job.createdAt)).toLocaleDateString("vi-VN")
      : "—",
    quantity:
      job.quantity != null && job.quantity !== ""
        ? `${job.quantity} người`
        : "—",
    description: splitTextBlocks(job.description),
    requirements: splitTextBlocks(job.requirements),
    benefits: splitTextBlocks(job.benefits),
    tags: skillNames,
    isSaved: job.isSaved === true,
  };
}
