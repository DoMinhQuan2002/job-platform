"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  MessageSquare,
  Power,
  Trash2,
  UserSearch,
  Users,
  XCircle,
} from "lucide-react";
import type { RecruiterJobDetail, RecruiterJobStatus } from "@/services/recruiter-jobs.service";
import { formatDate, jobStatusLabels } from "./job-detail-utils";

type JobDetailSidebarProps = {
  job: RecruiterJobDetail;
  updatingStatus: boolean;
  onUpdateStatus: (status: "OPEN" | "CLOSED" | "HIDDEN") => void;
};

const statusOrder: RecruiterJobStatus[] = ["PENDING", "APPROVED", "OPEN", "CLOSED"];

export function JobDetailSidebar({ job, updatingStatus, onUpdateStatus }: JobDetailSidebarProps) {
  const currentIndex = statusOrder.indexOf(job.status);
  const isSpecialStatus = job.status === "HIDDEN" || job.status === "REJECTED";

  const allSteps = [
    ...statusOrder.map((status, index) => {
      const reached = currentIndex >= index || job.status === status;
      const isCurrent = index === currentIndex && !isSpecialStatus;
      return {
        key: status,
        label: status === "OPEN" ? "Mở tin - Đang tuyển" : jobStatusLabels[status],
        date: reached ? formatDate(index === 0 ? job.createdAt : job.updatedAt) : "Chưa thực hiện",
        reached,
        isCurrent,
        isSpecial: false,
      };
    }),
    ...(isSpecialStatus
      ? [
          {
            key: job.status,
            label: jobStatusLabels[job.status],
            date: formatDate(job.updatedAt),
            reached: true,
            isCurrent: true,
            isSpecial: true,
          },
        ]
      : []),
  ];

  const stats = [
    { label: "Tổng số ứng viên", value: job.applicationStats.total, icon: Users, tone: "bg-purple/10 text-purple" },
    { label: "HR đã xem", value: job.applicationStats.byStatus.VIEWED, icon: Eye, tone: "bg-primary/10 text-primary" },
    { label: "Mời phỏng vấn", value: job.applicationStats.byStatus.INTERVIEW, icon: MessageSquare, tone: "bg-info/10 text-info" },
    { label: "Trúng tuyển", value: job.applicationStats.byStatus.ACCEPTED, icon: CheckCircle2, tone: "bg-success/10 text-success" },
    { label: "Không đạt", value: job.applicationStats.byStatus.REJECTED, icon: XCircle, tone: "bg-danger/10 text-danger" },
  ];

  return (
    <aside className="space-y-4">
      {/* Trạng thái tin - Timeline được căn giữa trục tuyệt đối */}
      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-text">Trạng thái tin</h2>
        <div className="space-y-0">
          {allSteps.map((step, index) => {
            const isLast = index === allSteps.length - 1;
            let dotColor = "bg-border";
            if (step.isSpecial) {
              dotColor = "bg-warning";
            } else if (step.reached) {
              dotColor = step.isCurrent ? "bg-primary" : "bg-success";
            }

            return (
              <div
                key={step.key}
                className={`flex gap-3 ${step.reached ? "" : "opacity-45"}`}
              >
                {/* Cột trục dọc chứa chấm tròn và đường kẻ kết nối thẳng hàng tuyệt đối */}
                <div className="flex w-3 shrink-0 flex-col items-center">
                  <span
                    className={`mt-1 size-2.5 shrink-0 rounded-full ring-4 ring-surface ${dotColor}`}
                  />
                  {!isLast && <span className="my-1 w-0.5 flex-1 min-h-[22px] bg-border" />}
                </div>

                {/* Nội dung trạng thái */}
                <div className={`min-w-0 ${isLast ? "pb-0" : "pb-4"}`}>
                  <p className="text-xs font-medium text-text">{step.label}</p>
                  <p className="mt-0.5 text-[10px] text-muted">{step.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Thống kê ứng tuyển */}
      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-text">Thống kê ứng tuyển</h2>
        <div className="space-y-3">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="flex items-center gap-3">
              <span className={`grid size-6 place-items-center rounded-full ${tone}`}>
                <Icon className="size-3.5" />
              </span>
              <span className="flex-1 text-xs text-muted">{label}</span>
              <strong className="text-xs text-text">{value}</strong>
            </div>
          ))}
        </div>
        <Link
          href={`/recruiter/candidates?jobId=${job.id}`}
          className="mt-5 block cursor-pointer rounded-md border border-primary py-2 text-center text-xs font-medium text-primary transition hover:bg-primary/5"
        >
          Xem danh sách ứng viên
        </Link>
      </section>

      {/* Thao tác nhanh */}
      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-text">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/recruiter/candidates?jobId=${job.id}`}
            className="flex cursor-pointer flex-col items-center gap-1 rounded-md border border-border p-3 text-[10px] text-muted transition hover:bg-background hover:text-primary"
          >
            <UserSearch className="size-4" />
            Xem ứng viên
          </Link>
          {job.status === "OPEN" ? (
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => onUpdateStatus("CLOSED")}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-md border border-border p-3 text-[10px] text-muted transition hover:bg-background hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Power className="size-4 text-danger" />
              Đóng tin
            </button>
          ) : (
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => onUpdateStatus("OPEN")}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-md border border-border p-3 text-[10px] text-muted transition hover:bg-background hover:text-success disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Power className="size-4 text-success" />
              Mở tin
            </button>
          )}
          <button
            type="button"
            disabled={updatingStatus}
            onClick={() => onUpdateStatus("HIDDEN")}
            className="flex cursor-pointer flex-col items-center gap-1 rounded-md border border-border p-3 text-[10px] text-muted transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            <EyeOff className="size-4" />
            Ẩn tin
          </button>
          <button
            type="button"
            disabled
            title="API xóa tin chưa được hỗ trợ"
            className="flex cursor-not-allowed flex-col items-center gap-1 rounded-md border border-danger/20 bg-danger/5 p-3 text-[10px] text-danger opacity-50"
          >
            <Trash2 className="size-4" />
            Xóa tin
          </button>
        </div>
      </section>
    </aside>
  );
}
