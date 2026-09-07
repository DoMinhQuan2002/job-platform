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
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { recruiterJobsApi, type RecruiterJobsResponse } from "@/services/recruiter-jobs.service";
import { JobStatusTabs, type JobStatusFilter } from "./job-status-tabs";
import { RecruiterJobsSkeleton } from "./recruiter-jobs-skeleton";
import { RecruiterJobsTable } from "./recruiter-jobs-table";
import {
  RecruiterJobsFilterPanel,
  type RecruiterJobsFilterValues,
} from "./recruiter-jobs-filter-panel";

export function RecruiterJobsPage() {
  const [status, setStatus] = useState<JobStatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [data, setData] = useState<RecruiterJobsResponse | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<RecruiterJobsFilterValues>({
    salaryRange: "ALL",
    location: "",
    sort: "newest",
  });

  const resetFilters = useCallback(() => {
    setIsTableLoading(true);
    setFilters({
      salaryRange: "ALL",
      location: "",
      sort: "newest",
    });
    setPage(1);
  }, []);

  const changeStatus = useCallback((nextStatus: JobStatusFilter) => {
    setIsTableLoading(true);
    setStatus(nextStatus);
    setPage(1);
  }, []);

  const retry = useCallback(() => {
    setIsTableLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;
    setIsTableLoading(true);
    setError(null);

    let minSalary: number | undefined;
    let maxSalary: number | undefined;
    let isNegotiable: boolean | undefined;

    switch (filters.salaryRange) {
      case "UNDER_10M":
        minSalary = 0;
        maxSalary = 10000000;
        break;
      case "10M_20M":
        minSalary = 10000000;
        maxSalary = 20000000;
        break;
      case "20M_30M":
        minSalary = 20000000;
        maxSalary = 30000000;
        break;
      case "ABOVE_30M":
        minSalary = 30000000;
        break;
      case "NEGOTIABLE":
        isNegotiable = true;
        break;
    }

    recruiterJobsApi
      .list(
        {
          status: status === "ALL" ? undefined : status,
          page,
          limit,
          location: filters.location.trim() || undefined,
          minSalary,
          maxSalary,
          isNegotiable,
          sort: filters.sort,
        },
        controller.signal,
      )
      .then((response) => {
        if (!ignore) {
          setData(response.data);
          setError(null);
        }
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
        if (!ignore) {
          setIsInitialLoading(false);
          setIsTableLoading(false);
        }
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [status, page, limit, filters, reloadKey]);

  if (isInitialLoading && !data) return <RecruiterJobsSkeleton />;

  if (error && !data) {
    return (
      <div className="flex min-h-[420px] w-full items-center justify-center">
        <div className="max-w-md rounded-lg border border-danger/20 bg-surface p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 size-10 text-danger" />
          <h1 className="font-semibold text-text">Không thể tải danh sách tin</h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mx-auto mt-5 flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
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

  const hasActiveFilters =
    filters.salaryRange !== "ALL" ||
    filters.location.trim() !== "" ||
    filters.sort !== "newest";

  return (
    <div className="w-full space-y-6">
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
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                isFilterOpen || hasActiveFilters
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-surface text-text hover:bg-background"
              }`}
            >
              <Filter className="size-3.5" />
              <span>Bộ lọc</span>
              {hasActiveFilters && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
              <ChevronDown
                className={`size-3 transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
              />
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted hover:border-danger/30 hover:bg-danger/5 hover:text-danger transition animate-in fade-in"
                title="Xóa tất cả bộ lọc đang chọn"
              >
                <RotateCcw className="size-3" />
                <span>Xóa bộ lọc</span>
              </button>
            )}

            <Link href="/recruiter/jobs/new" className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-hover">
              <Plus className="size-4" /> Đăng tin mới
            </Link>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <RecruiterJobsFilterPanel
            initialValues={filters}
            onApply={(newFilters) => {
              setIsTableLoading(true);
              setFilters(newFilters);
              setPage(1);
            }}
            onReset={resetFilters}
          />
        )}

        {error && (
          <div className="flex items-center justify-between gap-3 border-b border-warning/20 bg-warning/10 px-5 py-3 text-xs text-warning">
            <span>Không thể cập nhật dữ liệu mới: {error}</span>
            <button type="button" onClick={retry} className="cursor-pointer font-semibold underline">Thử lại</button>
          </div>
        )}

        {/* Bảng dữ liệu: dùng skeleton rows load trực tiếp trong bảng, giữ nguyên toàn bộ giao diện trang */}
        <div>
          <RecruiterJobsTable
            jobs={data?.items ?? []}
            isLoading={isTableLoading}
            onReload={retry}
          />
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
                  setIsTableLoading(true);
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
                className="cursor-pointer rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-text outline-none focus:border-primary"
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
                  setIsTableLoading(true);
                  setPage((current) => Math.max(1, current - 1));
                }}
                disabled={page <= 1 || isTableLoading}
                className="grid size-8 cursor-pointer place-items-center rounded border border-border text-muted hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Trang trước"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <span className="grid min-w-8 place-items-center rounded bg-primary px-2 text-xs font-medium text-white">{page}</span>
              <button
                type="button"
                onClick={() => {
                  setIsTableLoading(true);
                  setPage((current) => current + 1);
                }}
                disabled={page >= pagination.totalPages || isTableLoading}
                className="grid size-8 cursor-pointer place-items-center rounded border border-border text-muted hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
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
        
      </aside>
    </div>
  );
}
