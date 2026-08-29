"use client";

import { BriefcaseBusiness, FileText, RefreshCw, Users } from "lucide-react";
import { useEffect, useReducer } from "react";
import {
  recruiterStatisticsApi,
  type OverviewData,
} from "@/services/recruiter-statistics.service";
import { DashboardCard } from "./dashboard-card";

function formatDiff(diff: number, periodDays: number): string {
  const sign = diff > 0 ? "+" : diff < 0 ? "" : "+";
  return `${sign}${diff} so với ${periodDays} ngày trước`;
}

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded bg-border/45 ${className}`} />
);

function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex min-h-28 items-start gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm"
        >
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: OverviewData };

type Action =
  | { type: "success"; data: OverviewData }
  | { type: "error"; message: string }
  | { type: "reset" };

function reducer(_state: State, action: Action): State {
  if (action.type === "success") return { status: "success", data: action.data };
  if (action.type === "reset") return { status: "loading" };
  return { status: "error", message: action.message };
}

export function DashboardStats() {
  const [state, dispatch] = useReducer(reducer, { status: "loading" });
  const [reloadKey, setReloadKey] = useReducer((k: number) => k + 1, 0);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    recruiterStatisticsApi
      .getOverview({ days: 30 }, controller.signal)
      .then((res) => {
        if (!ignore) dispatch({ type: "success", data: res.data });
      })
      .catch((err: unknown) => {
        if (!ignore)
          dispatch({
            type: "error",
            message: err instanceof Error ? err.message : "Không thể tải thống kê.",
          });
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [reloadKey]);

  if (state.status === "loading") return <DashboardStatsSkeleton />;

  if (state.status === "error") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-danger/20 bg-danger/5 px-5 py-4 text-sm text-danger shadow-sm">
        <span>{state.message}</span>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "reset" });
            setReloadKey();
          }}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-danger px-3 py-1.5 text-xs font-medium text-white hover:bg-danger/90"
        >
          <RefreshCw className="size-3.5" />
          Thử lại
        </button>
      </div>
    );
  }

  const { data } = state;
  const { periodDays } = data.comparison;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <DashboardCard
        label="Tin đăng đang tuyển"
        value={data.activeJobs}
        detail={`${data.totalJobs} tổng số tin đã đăng`}
        icon={BriefcaseBusiness}
      />
      <DashboardCard
        label="Ứng viên mới"
        value={data.newCandidates}
        detail={formatDiff(data.comparison.diffNewCandidates, periodDays)}
        icon={FileText}
        tone="success"
        positive={data.comparison.diffNewCandidates >= 0}
      />
      <DashboardCard
        label="Tổng ứng viên"
        value={data.totalCandidates}
        detail={formatDiff(data.newCandidates, periodDays)}
        icon={Users}
        tone="purple"
        positive={data.newCandidates >= 0}
      />
    </div>
  );
}
