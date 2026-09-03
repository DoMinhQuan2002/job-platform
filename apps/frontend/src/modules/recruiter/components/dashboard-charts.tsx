"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import {
  recruiterStatisticsApi,
  type ApplicationsByStatusData,
  type ApplicationStatus,
  type CandidateTrendData,
} from "@/services/recruiter-statistics.service";

// ─── Skeleton helper ─────────────────────────────────────────────────────────
const Sk = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded bg-border/45 ${className}`} />
);

// ─── CandidateTrendChart ──────────────────────────────────────────────────────
function normalizeTrendPoints(
  points: CandidateTrendData["points"],
  key: "current" | "previous",
): number[] {
  const max = Math.max(...points.map((p) => Math.max(p.current, p.previous)), 1);
  // SVG viewBox 0 0 600 200; top margin 10, bottom 10 → usable height 180
  return points.map((p) => 200 - 10 - (p[key] / max) * 180);
}

function buildPolyline(ys: number[], count: number): string {
  return ys
    .map((y, i) => `${(i / Math.max(count - 1, 1)) * 600},${y}`)
    .join(" ");
}

function buildPolygon(ys: number[], count: number): string {
  const line = buildPolyline(ys, count);
  return `${line} 600,200 0,200`;
}

// Labels: show first, middle, last up to 5 evenly spaced
function getLabels(points: CandidateTrendData["points"]): string[] {
  if (points.length <= 5) return points.map((p) => p.label);
  const step = (points.length - 1) / 4;
  return [0, 1, 2, 3, 4].map((i) => points[Math.round(i * step)]!.label);
}

type AsyncState<T> = { loading: boolean; error: string | null; data: T | null };

export function CandidateTrendChart() {
  const [state, setState] = useState<AsyncState<CandidateTrendData>>({
    loading: true,
    error: null,
    data: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    recruiterStatisticsApi
      .getCandidateTrend({ days: 30, groupBy: "day" }, controller.signal)
      .then((res) => {
        if (!ignore) setState({ loading: false, error: null, data: res.data });
      })
      .catch((err: unknown) => {
        if (!ignore)
          setState({
            loading: false,
            error: err instanceof Error ? err.message : "Không thể tải biểu đồ.",
            data: null,
          });
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [reloadKey]);

  const { loading, error, data } = state;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm lg:col-span-2">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-text">Thống kê ứng viên mới</h2>
        <div className="flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-2">
            <i className="h-1 w-3 rounded bg-primary" />
            Kỳ này
          </span>
          <span className="flex items-center gap-2">
            <i className="h-1 w-3 rounded bg-primary/25" />
            Kỳ trước
          </span>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          <Sk className="h-72 w-full rounded-lg" />
          <div className="flex justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <Sk key={i} className="h-3 w-10" />
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="flex h-72 flex-col items-center justify-center gap-3 text-sm text-muted">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white"
          >
            <RefreshCw className="size-3.5" />
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && data && (() => {
        const pts = data.points;
        const count = pts.length;

        if (count === 0) {
          return (
            <div className="flex h-72 items-center justify-center text-sm text-muted">
              Chưa có dữ liệu trong kỳ này.
            </div>
          );
        }

        const currentYs = normalizeTrendPoints(pts, "current");
        const previousYs = normalizeTrendPoints(pts, "previous");

        return (
          <>
            <div className="h-72 w-full overflow-hidden">
              <svg
                className="h-full w-full"
                viewBox="0 0 600 200"
                preserveAspectRatio="none"
                role="img"
                aria-label="Biểu đồ số ứng viên mới"
              >
                {[10, 50, 90, 130, 170, 200].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="600"
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    className="text-border"
                    strokeDasharray="4 4"
                  />
                ))}
                {/* Kỳ trước */}
                <polyline
                  fill="none"
                  points={buildPolyline(previousYs, count)}
                  stroke="currentColor"
                  className="text-primary/25"
                  strokeDasharray="5 5"
                  strokeWidth="2"
                />
                {/* Kỳ này — fill area */}
                <polygon
                  points={buildPolygon(currentYs, count)}
                  fill="currentColor"
                  className="text-primary/5"
                />
                {/* Kỳ này — line */}
                <polyline
                  fill="none"
                  points={buildPolyline(currentYs, count)}
                  stroke="currentColor"
                  className="text-primary"
                  strokeWidth="3"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[11px] text-muted">
              {getLabels(pts).map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              Kỳ này:{" "}
              <strong className="text-text">{data.summary.totalCurrent}</strong>{" "}
              ứng viên &nbsp;·&nbsp; Kỳ trước:{" "}
              <strong className="text-text">{data.summary.totalPrevious}</strong>{" "}
              &nbsp;·&nbsp; Chênh lệch:{" "}
              <strong
                className={
                  data.summary.diff >= 0 ? "text-success" : "text-danger"
                }
              >
                {data.summary.diff >= 0 ? "+" : ""}
                {data.summary.diff}
              </strong>
            </p>
          </>
        );
      })()}
    </section>
  );
}

// ─── CandidateStatusChart ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; cssVar: string }
> = {
  APPLIED:   { label: "Đã nộp",          color: "bg-primary",      cssVar: "var(--primary)" },
  VIEWED:    { label: "HR đã xem",        color: "bg-success",      cssVar: "var(--color-success)" },
  INTERVIEW: { label: "Mời phỏng vấn",   color: "bg-warning",      cssVar: "var(--color-warning)" },
  ACCEPTED:  { label: "Trúng tuyển",     color: "bg-lime-500",     cssVar: "#84cc16" },
  REJECTED:  { label: "Không đạt",       color: "bg-danger",       cssVar: "var(--destructive)" },
  WITHDRAWN: { label: "Đã rút đơn",      color: "bg-muted/40",     cssVar: "var(--muted-foreground)" },
};

const STATUS_ORDER: ApplicationStatus[] = [
  "APPLIED", "VIEWED", "INTERVIEW", "ACCEPTED", "REJECTED", "WITHDRAWN",
];

function buildConicGradient(byStatus: ApplicationsByStatusData["byStatus"], total: number): string {
  if (total === 0) return "var(--border)";
  let cumulative = 0;
  const stops: string[] = [];

  for (const key of STATUS_ORDER) {
    const count = byStatus[key] ?? 0;
    if (count === 0) continue;
    const pct = (count / total) * 100;
    const { cssVar } = STATUS_CONFIG[key];
    stops.push(`${cssVar} ${cumulative.toFixed(2)}% ${(cumulative + pct).toFixed(2)}%`);
    cumulative += pct;
  }

  return `conic-gradient(${stops.join(", ")})`;
}

export function CandidateStatusChart() {
  const [state, setState] = useState<AsyncState<ApplicationsByStatusData>>({
    loading: true,
    error: null,
    data: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    recruiterStatisticsApi
      .getApplicationsByStatus(undefined, controller.signal)
      .then((res) => {
        if (!ignore) setState({ loading: false, error: null, data: res.data });
      })
      .catch((err: unknown) => {
        if (!ignore)
          setState({
            loading: false,
            error: err instanceof Error ? err.message : "Không thể tải biểu đồ.",
            data: null,
          });
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [reloadKey]);

  const { loading, error, data } = state;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <h2 className="mb-6 font-bold text-text">Ứng viên theo trạng thái</h2>

      {loading && (
        <div className="space-y-4">
          <Sk className="mx-auto size-44 rounded-full" />
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Sk key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-sm text-muted">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white"
          >
            <RefreshCw className="size-3.5" />
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div
            className="mx-auto mb-6 grid size-44 place-items-center rounded-full"
            style={{ background: buildConicGradient(data.byStatus, data.total) }}
          >
            <div className="grid size-28 place-items-center rounded-full bg-surface text-center">
              <div>
                <strong className="block text-2xl">{data.total}</strong>
                <span className="text-xs text-muted">Tổng ứng viên</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {STATUS_ORDER.map((key) => {
              const count = data.byStatus[key] ?? 0;
              const pct =
                data.total > 0 ? ((count / data.total) * 100).toFixed(1) : "0.0";
              const { label, color } = STATUS_CONFIG[key];
              return (
                <div key={key} className="flex items-center">
                  <i className={`mr-2 size-2.5 rounded-full ${color}`} />
                  <span className="flex-1 text-muted">{label}</span>
                  <strong className="mr-1">{count}</strong>
                  <span className="text-xs text-muted">({pct}%)</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
