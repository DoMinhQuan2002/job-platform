"use client";

import { ArrowRight, Bell, CheckCircle2, RefreshCw, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useReducer, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { notificationsApi } from "@/modules/notifications/api";
import {
  NOTIFICATION_ICON,
  formatRelativeTime,
  notificationIconClass,
} from "@/modules/notifications/lib/format";
import type { NotificationItem } from "@/modules/notifications/types";
import {
  recruiterStatisticsApi,
  type RecentJob,
} from "@/services/recruiter-statistics.service";

// ─── Job status display ───────────────────────────────────────────────────────
const JOB_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ duyệt", color: "text-warning bg-warning/10" },
  APPROVED: { label: "Đã duyệt", color: "text-primary bg-primary/10" },
  OPEN: { label: "Đang tuyển", color: "text-success bg-success/10" },
  HIDDEN: { label: "Đã ẩn", color: "text-muted bg-background" },
  REJECTED: { label: "Bị từ chối", color: "text-danger bg-danger/10" },
  CLOSED: { label: "Đã đóng", color: "text-muted bg-background" },
};

function formatDeadline(deadline: string): string {
  try {
    return new Date(deadline).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return deadline;
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sk = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded bg-border/45 ${className}`} />
);

function RecentJobsSkeleton() {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <h2 className="border-b border-border p-5 font-bold">Tin đăng gần đây</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-background text-xs uppercase text-muted">
            <tr>
              <th className="p-4">Vị trí tuyển dụng</th>
              <th>Trạng thái</th>
              <th>Ứng viên</th>
              <th>Hạn nộp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="px-4 py-3">
                <td className="p-4">
                  <Sk className="h-4 w-48" />
                </td>
                <td>
                  <Sk className="h-6 w-20 rounded-full" />
                </td>
                <td>
                  <Sk className="h-4 w-6" />
                </td>
                <td>
                  <Sk className="h-4 w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── RecentJobs ───────────────────────────────────────────────────────────────
type State = { jobs: RecentJob[]; loading: boolean; error: string | null };
type Action =
  | { type: "fetch" }
  | { type: "success"; jobs: RecentJob[] }
  | { type: "error"; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "fetch":   return { jobs: state.jobs, loading: true, error: null };
    case "success": return { jobs: action.jobs, loading: false, error: null };
    case "error":   return { jobs: state.jobs, loading: false, error: action.message };
  }
}

const INITIAL_STATE: State = { jobs: [], loading: true, error: null };

export function RecentJobs() {
  const [{ jobs, loading, error }, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [reloadKey, setReloadKey] = useReducer((k: number) => k + 1, 0);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    recruiterStatisticsApi
      .getRecentJobs(5, controller.signal)
      .then((res) => {
        if (!ignore) dispatch({ type: "success", jobs: res.data });
      })
      .catch((err: unknown) => {
        if (!ignore)
          dispatch({
            type: "error",
            message: err instanceof Error ? err.message : "Không thể tải danh sách tin.",
          });
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [reloadKey]);

  if (loading) return <RecentJobsSkeleton />;

  return (
    <section className="h-full flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <h2 className="border-b border-border p-5 font-bold">Tin đăng gần đây</h2>

      {error && (
        <div className="flex items-center justify-between gap-3 border-b border-warning/20 bg-warning/5 px-5 py-3 text-xs text-warning">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => { dispatch({ type: "fetch" }); setReloadKey(); }}
            className="flex items-center gap-1 font-semibold underline"
          >
            <RefreshCw className="size-3" />
            Thử lại
          </button>
        </div>
      )}

      {/* thêm flex-1 + overflow-y-auto ở đây */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-background text-xs uppercase text-muted">
            <tr>
              <th className="p-4">Vị trí tuyển dụng</th>
              <th>Trạng thái</th>
              <th>Ứng viên</th>
              <th>Hạn nộp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.length === 0 && !error ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-sm text-muted">
                  Chưa có tin tuyển dụng nào.
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const statusInfo =
                  JOB_STATUS_MAP[job.status] ?? {
                    label: job.status,
                    color: "text-muted bg-background",
                  };
                return (
                  <tr key={job.id} className="hover:bg-background/70">
                    <td className="p-4 font-medium">{job.title}</td>
                    <td>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>{job.applicantCount}</td>
                    <td className="text-muted">{formatDeadline(job.deadline)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* bỏ div justify-end thừa, button tự nằm cuối vì flex-col + flex-1 ở trên */}
      <Link
        href="/recruiter/jobs"
        className="group flex w-full shrink-0 cursor-pointer items-center justify-between border-t border-border p-4 text-sm font-medium text-primary transition-colors hover:bg-primary/5 hover:text-primary-hover"
      >
        <span>Xem tất cả tin đăng</span>
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </section>
  );
}

// ─── RecentActivity (thông báo thật từ hệ thống) ─────────────────────────────
export function RecentActivity() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = () => {
    setLoading(true);
    setError(null);
    notificationsApi
      .list({ page: 1, limit: 5 })
      .then((res) => {
        setNotifications(res.data?.items ?? []);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Không tải được hoạt động gần đây.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadActivities();
    window.addEventListener("jp-notifications-change", loadActivities);
    return () => {
      window.removeEventListener("jp-notifications-change", loadActivities);
    };
  }, []);

  return (
    <section className="flex rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex w-full flex-col">
        <h2 className="border-b border-border p-5 font-bold">Hoạt động gần đây</h2>
        <div className="flex-1 space-y-4 p-5">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Sk className="size-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Sk className="h-4 w-full" />
                    <Sk className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-xs text-danger">{error}</p>
              <button
                type="button"
                onClick={loadActivities}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                Thử lại
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">
              Chưa có hoạt động nào gần đây.
            </div>
          ) : (
            notifications.map((item) => {
              const Icon = NOTIFICATION_ICON[item.type] ?? Bell;
              const colorClass = notificationIconClass(item.type);
              const relativeTime = formatRelativeTime(item.createdAt);

              return (
                <Link
                  key={item.id}
                  href={`${ROUTES.recruiter.notifications}/${item.id}`}
                  className="group -mx-2 -my-1.5 flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full transition-transform group-hover:scale-105",
                      colorClass,
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-slate-800 transition-colors group-hover:text-primary">
                      {item.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                      {item.content}
                    </p>
                    <span className="mt-1 block text-[11px] text-muted">
                      {relativeTime}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
        <Link
          href={ROUTES.recruiter.notifications}
          className="group flex w-full cursor-pointer items-center justify-between border-t border-border p-4 text-sm font-medium text-primary transition-colors hover:bg-primary/5 hover:text-primary-hover"
        >
          <span>Xem tất cả hoạt động</span>
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
