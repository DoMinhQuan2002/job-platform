"use client";

import { ArrowRight, CheckCircle2, RefreshCw, UserPlus, Users } from "lucide-react";
import { useEffect, useReducer } from "react";
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
      <button
        type="button"
        className="flex w-full shrink-0 items-center justify-between border-t border-border p-4 text-sm font-medium text-primary hover:bg-background/50"
        onClick={() => window.location.assign("/recruiter/jobs")}
      >
        Xem tất cả tin đăng <ArrowRight className="size-4" />
      </button>
    </section>
  );
}

// ─── RecentActivity (giữ nguyên static, chưa có API) ─────────────────────────
export function RecentActivity() {
  const items = [
    {
      icon: UserPlus,
      text: "Nguyễn Văn A đã ứng tuyển vào Digital Marketing.",
      time: "2 phút trước",
      color: "text-primary bg-primary/10",
    },
    {
      icon: CheckCircle2,
      text: "Tin Nhân viên Kinh doanh đã được duyệt.",
      time: "15 phút trước",
      color: "text-success bg-success/10",
    },
    {
      icon: Users,
      text: "Công ty của bạn đã được xác thực.",
      time: "2 giờ trước",
      color: "text-purple bg-purple/10",
    },
  ];

  return (
    <section className="flex rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex w-full flex-col">
        <h2 className="border-b border-border p-5 font-bold">Hoạt động gần đây</h2>
        <div className="flex-1 space-y-5 p-5">
          {items.map(({ icon: Icon, text, time, color }) => (
            <div key={text} className="flex gap-3">
              <span className={`grid size-8 shrink-0 place-items-center rounded-full ${color}`}>
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-sm leading-relaxed">{text}</p>
                <span className="text-xs text-muted">{time}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-between border-t border-border p-4 text-sm font-medium text-primary"
        >
          Xem tất cả hoạt động <ArrowRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
