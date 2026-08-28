import Link from "next/link";
import { Banknote, CalendarDays, Clock3, Eye, FileText, MapPin, Pencil } from "lucide-react";
import type { RecruiterJobDetail } from "@/services/recruiter-jobs.service";
import { formatDate, formatSalary, jobModeLabels, jobStatusLabels, jobStatusStyles, jobTypeLabels } from "./job-detail-utils";

export function JobSummaryCard({ job }: { job: RecruiterJobDetail }) {
  const facts = [
    { icon: Banknote, value: formatSalary(job), detail: job.isNegotiable ? "Theo năng lực" : "Mức lương đăng tuyển" },
    { icon: MapPin, value: job.address, detail: job.category?.name ?? "Địa điểm làm việc" },
    { icon: Clock3, value: jobTypeLabels[job.jobType], detail: jobModeLabels[job.jobMode] },
    { icon: CalendarDays, value: "Hạn nộp hồ sơ", detail: formatDate(job.deadline), danger: true },
  ];

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="grid size-20 shrink-0 place-items-center rounded-lg border border-border bg-background text-primary">
          <FileText className="size-8" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-text">{job.title}</h1>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${jobStatusStyles[job.status]}`}>{jobStatusLabels[job.status]}</span>
              </div>
              <p className="mt-2 text-[11px] text-muted">
                Mã tin: #{job.id} · Đăng ngày: {formatDate(job.createdAt)} · Cập nhật: {formatDate(job.updatedAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/jobs/${job.id}`} target="_blank" aria-label="Xem trước tin" className="grid size-8 place-items-center rounded-md border border-border text-muted hover:bg-background hover:text-primary"><Eye className="size-4" /></Link>
              <Link href={`/recruiter/jobs/${job.id}/edit`} aria-label="Sửa tin" className="grid size-8 place-items-center rounded-md bg-primary text-white hover:bg-primary-hover"><Pencil className="size-4" /></Link>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {facts.map(({ icon: Icon, value, detail, danger }) => (
              <div key={value} className="flex min-w-0 items-start gap-2.5">
                <span className={`grid size-7 shrink-0 place-items-center rounded-full ${danger ? "bg-danger/10 text-danger" : "bg-background text-muted"}`}><Icon className="size-3.5" /></span>
                <div className="min-w-0"><p className="truncate text-xs font-medium text-text" title={value}>{value}</p><p className={`mt-1 text-[10px] ${danger ? "font-medium text-danger" : "text-muted"}`}>{detail}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
