"use client";

import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Filter,
  Info,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { recruiterJobsApi, type RecruiterJobsResponse } from "@/services/recruiter-jobs.service";
import { JobStatusTabs, type JobStatusFilter } from "./job-status-tabs";
import { RecruiterJobsSkeleton } from "./recruiter-jobs-skeleton";
import { RecruiterJobsTable } from "./recruiter-jobs-table";

export function RecruiterJobsPage() {
  const [status, setStatus] = useState<JobStatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [data, setData] = useState<RecruiterJobsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const beginRequest = useCallback(() => {
    setData(null);
    setIsLoading(true);
    setError(null);
  }, []);

  const changeStatus = useCallback((nextStatus: JobStatusFilter) => {
    beginRequest();
    setStatus(nextStatus);
    setPage(1);
  }, [beginRequest]);

  const retry = useCallback(() => {
    beginRequest();
    setReloadKey((key) => key + 1);
  }, [beginRequest]);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    recruiterJobsApi
      .list(
        { status: status === "ALL" ? undefined : status, page, limit },
        controller.signal,
      )
      .then((response) => {
        if (!ignore) setData(response.data);
      })
      .catch((requestError: unknown) => {
        if (!ignore) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Không thể tải danh sách tin tuyển dụng.",
          );
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [status, page, limit, reloadKey]);

  if (isLoading && !data) return <RecruiterJobsSkeleton />;

  if (error && !data) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-6xl items-center justify-center">
        <div className="max-w-md rounded-lg border border-danger/20 bg-surface p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 size-10 text-danger" />
          <h1 className="font-semibold text-text">Không thể tải danh sách tin</h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mx-auto mt-5 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <RefreshCw className="size-4" /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  const pagination = data?.pagination ?? {
    page: 1,
    limit,
    totalItems: 0,
    totalPages: 0,
  };
  const counts: Partial<Record<JobStatusFilter, number>> = {
    ...data?.statusCounts,
    ALL: data?.statusCounts
      ? Object.values(data.statusCounts).reduce((sum, count) => sum + count, 0)
      : 0,
  };
  const firstItem =
    pagination.totalItems === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1;
  const lastItem = Math.min(
    pagination.page * pagination.limit,
    pagination.totalItems,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header>
        <h1 className="text-xl font-bold text-text">Quản lý tin tuyển dụng</h1>
        <p className="mt-1 text-xs text-muted">
          Quản lý và theo dõi các tin tuyển dụng của công ty.
        </p>
      </header>

      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="overflow-x-auto">
            <JobStatusTabs value={status} onChange={changeStatus} counts={counts} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text hover:bg-background">
              <Filter className="size-3.5" /> Bộ lọc <ChevronDown className="size-3" />
            </button>
            <Link href="/recruiter/jobs/new" className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-hover">
              <Plus className="size-4" /> Đăng tin mới
            </Link>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-3 border-b border-warning/20 bg-warning/10 px-5 py-3 text-xs text-warning">
            <span>Không thể cập nhật dữ liệu mới: {error}</span>
            <button type="button" onClick={retry} className="font-semibold underline">Thử lại</button>
          </div>
        )}

        <div className={isLoading ? "pointer-events-none opacity-50" : ""}>
          <RecruiterJobsTable jobs={data?.items ?? []} />
        </div>

        <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted">
            Hiển thị {firstItem} - {lastItem} trong {pagination.totalItems} tin tuyển dụng
          </span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted">
              Hiển thị
              <select
                value={limit}
                onChange={(event) => {
                  beginRequest();
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
                className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-text outline-none focus:border-primary"
              >
                <option value={8}>8</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
            <nav className="flex gap-1" aria-label="Phân trang">
              <button
                type="button"
                onClick={() => {
                  beginRequest();
                  setPage((current) => Math.max(1, current - 1));
                }}
                disabled={page <= 1 || isLoading}
                className="grid size-8 place-items-center rounded border border-border text-muted hover:bg-background disabled:opacity-40"
                aria-label="Trang trước"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <span className="grid min-w-8 place-items-center rounded bg-primary px-2 text-xs font-medium text-white">{page}</span>
              <button
                type="button"
                onClick={() => {
                  beginRequest();
                  setPage((current) => current + 1);
                }}
                disabled={page >= pagination.totalPages || isLoading}
                className="grid size-8 place-items-center rounded border border-border text-muted hover:bg-background disabled:opacity-40"
                aria-label="Trang sau"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </nav>
          </div>
        </footer>
      </section>

      <aside className="flex flex-col gap-4 rounded-lg border border-primary/15 bg-primary/5 p-5 sm:flex-row sm:items-start">
        <Info className="size-5 shrink-0 text-primary" />
        <div className="flex-1">
          <h2 className="mb-2 text-sm font-semibold text-text">Lưu ý</h2>
          <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-muted">
            <li>Tin mới tạo sẽ ở trạng thái “Chờ duyệt”. Sau khi được admin duyệt, trạng thái sẽ chuyển sang “Đã duyệt”.</li>
            <li>Để tin hiển thị công khai và nhận hồ sơ, bạn cần mở tin để chuyển sang trạng thái “Đang tuyển”.</li>
          </ul>
        </div>
        <button type="button" className="flex shrink-0 items-center gap-2 rounded-lg border border-primary bg-surface px-3 py-2 text-xs font-medium text-primary hover:bg-primary/5">
          <CircleHelp className="size-4" /> Xem hướng dẫn
        </button>
      </aside>
    </div>
  );
}
