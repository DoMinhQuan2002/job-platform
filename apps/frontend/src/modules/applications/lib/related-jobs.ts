import type { Job } from "@/modules/jobs/types";
import type { RelatedJob } from "../types";

function formatSalary(job: Job): string {
  if (job.isNegotiable || (!job.salaryMin && !job.salaryMax)) return "Thỏa thuận";
  const format = (value: string | null) =>
    value ? `${Math.round(Number(value) / 1_000_000)} triệu` : "";
  return [format(job.salaryMin), format(job.salaryMax)].filter(Boolean).join(" - ");
}

export function toRelatedJob(job: Job): RelatedJob {
  return {
    id: job.id,
    title: job.title,
    companyName: job.company.name,
    logoUrl: job.company.logo ?? undefined,
    location: job.address,
    salary: formatSalary(job),
  };
}
