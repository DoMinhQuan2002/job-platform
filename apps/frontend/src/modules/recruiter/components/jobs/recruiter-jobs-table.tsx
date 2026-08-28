import { Ellipsis, Eye, Pencil, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { RecruiterJob, RecruiterJobStatus } from "@/services/recruiter-jobs.service";

const statusStyles: Record<RecruiterJobStatus, string> = {
  OPEN: "border-success/20 bg-success/10 text-success",
  APPROVED: "border-primary/20 bg-primary/10 text-primary",
  PENDING: "border-warning/20 bg-warning/10 text-warning",
  CLOSED: "border-border bg-background text-muted",
  HIDDEN: "border-border bg-background text-muted",
  REJECTED: "border-danger/20 bg-danger/10 text-danger",
};

const statusLabels: Record<RecruiterJobStatus, string> = {
  OPEN: "Đang tuyển",
  APPROVED: "Đã duyệt",
  PENDING: "Chờ duyệt",
  CLOSED: "Đã đóng",
  HIDDEN: "Đang ẩn",
  REJECTED: "Bị từ chối",
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const formatSalary = (job: RecruiterJob) => {
  if (job.isNegotiable) return "Thỏa thuận";
  if (job.salaryMin !== null && job.salaryMax !== null) {
    return `${currency.format(job.salaryMin)} - ${currency.format(job.salaryMax)}`;
  }
  if (job.salaryMin !== null) return `Từ ${currency.format(job.salaryMin)}`;
  if (job.salaryMax !== null) return `Đến ${currency.format(job.salaryMax)}`;
  return "Chưa cập nhật";
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
};

type RecruiterJobsTableProps = {
  jobs: RecruiterJob[];
};

const ActionButton = ({ label, children }: { label: string; children: ReactNode }) => (
  <button type="button" title={label} aria-label={label} className="grid size-8 place-items-center rounded-full border border-border text-muted transition hover:bg-background hover:text-primary">
    {children}
  </button>
);

export function RecruiterJobsTable({ jobs }: RecruiterJobsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-xs text-muted">
        <thead className="border-b border-border bg-background text-text">
          <tr>
            <th className="w-16 px-5 py-4 font-semibold">STT</th>
            <th className="px-5 py-4 font-semibold">Tên vị trí tuyển dụng</th>
            <th className="px-5 py-4 font-semibold">Lương</th>
            <th className="px-5 py-4 font-semibold">Địa điểm</th>
            <th className="px-5 py-4 font-semibold">Hạn nộp</th>
            <th className="px-5 py-4 font-semibold">Trạng thái</th>
            <th className="px-5 py-4 text-center font-semibold">Ứng viên</th>
            <th className="px-5 py-4 text-center font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {jobs.map((job, index) => (
            <tr key={job.id} className="transition hover:bg-background/70">
              <td className="px-5 py-4">{index + 1}</td>
              <td className="px-5 py-4">
                <p className="font-semibold text-text">{job.title}</p>
                <p className="mt-1 text-[10px] text-muted">Mã tin: #{job.id}</p>
              </td>
              <td className="whitespace-nowrap px-5 py-4">{formatSalary(job)}</td>
              <td className="max-w-40 truncate px-5 py-4" title={job.address}>{job.address}</td>
              <td className="whitespace-nowrap px-5 py-4">{formatDate(job.deadline)}</td>
              <td className="px-5 py-4">
                <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusStyles[job.status]}`}>
                  <i className="size-1.5 rounded-full bg-current" />
                  {statusLabels[job.status]}
                </span>
              </td>
              <td className="px-5 py-4 text-center font-medium text-text">{job.applicantCount}</td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-center gap-1.5">
                  <Link href={`/recruiter/jobs/${job.id}`} title="Xem chi tiết" aria-label="Xem chi tiết" className="grid size-8 place-items-center rounded-full border border-border text-muted transition hover:bg-background hover:text-primary"><Eye className="size-3.5" /></Link>
                  <Link href={`/recruiter/jobs/${job.id}/edit`} title="Sửa tin" aria-label="Sửa tin" className="grid size-8 place-items-center rounded-full border border-border text-muted transition hover:bg-background hover:text-primary"><Pencil className="size-3.5" /></Link>
                  <ActionButton label="Quản lý ứng viên"><Users className="size-3.5" /></ActionButton>
                  <ActionButton label="Thao tác khác"><Ellipsis className="size-3.5" /></ActionButton>
                </div>
              </td>
            </tr>
          ))}
          {jobs.length === 0 && (
            <tr><td colSpan={8} className="px-5 py-16 text-center text-sm text-muted">Không có tin tuyển dụng ở trạng thái này.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
