import type { RecruiterJob, RecruiterJobStatus } from "@/services/recruiter-jobs.service";

export const jobStatusLabels: Record<RecruiterJobStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  OPEN: "Đang tuyển",
  HIDDEN: "Đang ẩn",
  REJECTED: "Bị từ chối",
  CLOSED: "Đã đóng",
};

export const jobStatusStyles: Record<RecruiterJobStatus, string> = {
  PENDING: "bg-warning/10 text-warning",
  APPROVED: "bg-primary/10 text-primary",
  OPEN: "bg-success/10 text-success",
  HIDDEN: "bg-muted/10 text-muted",
  REJECTED: "bg-danger/10 text-danger",
  CLOSED: "bg-background text-muted",
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export const formatSalary = (job: RecruiterJob) => {
  if (job.isNegotiable) return "Thỏa thuận";
  if (job.salaryMin !== null && job.salaryMax !== null) {
    return `${currency.format(job.salaryMin)} - ${currency.format(job.salaryMax)}`;
  }
  if (job.salaryMin !== null) return `Từ ${currency.format(job.salaryMin)}`;
  if (job.salaryMax !== null) return `Đến ${currency.format(job.salaryMax)}`;
  return "Chưa cập nhật";
};

export const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
};

export const jobTypeLabels = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
};

export const jobModeLabels = {
  ONSITE: "Tại văn phòng",
  REMOTE: "Làm từ xa",
  HYBRID: "Linh hoạt",
};
