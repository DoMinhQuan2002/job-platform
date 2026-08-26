"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Bookmark,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ApiError } from "@/lib/api-error";
import { ROUTES } from "@/constants/routes";
import type { SavedJob } from "../types";
import { CandidateNavSidebar } from "../components/candidate-nav-sidebar";
import { SavedJobCard } from "../components/saved-job-card";
import { ApplyModal } from "../components/apply-modal";
import { applicationsApi } from "../api";
import { summarizeJob } from "../lib/job-summary";
import { formatDate } from "../lib/status";

type SortOption = "newest" | "salary" | "title";

function parseSalaryScore(salary: string): number {
  const nums = salary.match(/\d+/g)?.map(Number) ?? [];
  return nums.length ? Math.max(...nums) : 0;
}

export function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [applyingJob, setApplyingJob] = useState<SavedJob | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    try {
      const res = await applicationsApi.listSavedJobs();
      const records = res.data ?? [];
      const mapped = await Promise.all(
        records.map(async (item) => {
          try {
            const jobRes = await applicationsApi.getJobDetail(item.jobId);
            const summary = summarizeJob(jobRes.data);
            return {
              id: item.id,
              jobId: item.jobId,
              title: summary.title,
              companyName: summary.companyName,
              companyLogoUrl: summary.companyLogoUrl,
              location: summary.location,
              experience: summary.experience,
              salary: summary.salary,
              category: summary.category,
              savedDate: formatDate(item.createdAt),
              createdAt: item.createdAt,
            } satisfies SavedJob;
          } catch {
            return {
              id: item.id,
              jobId: item.jobId,
              title: `Job #${item.jobId}`,
              companyName: "Nhà tuyển dụng",
              location: "—",
              experience: "—",
              salary: "Thỏa thuận",
              category: "Tuyển dụng",
              savedDate: formatDate(item.createdAt),
              createdAt: item.createdAt,
            } satisfies SavedJob;
          }
        }),
      );
      setSavedJobs(mapped);
      setCurrentPage(1);
    } catch (err) {
      setSavedJobs([]);
      if (err instanceof ApiError && err.statusCode === 401) {
        setUnauthorized(true);
        setError("Bạn cần đăng nhập bằng tài khoản ứng viên.");
      } else {
        setError(err instanceof Error ? err.message : "Không tải được việc đã lưu.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sortedJobs = useMemo(() => {
    const list = [...savedJobs];
    if (sortOption === "salary") {
      list.sort((a, b) => parseSalaryScore(b.salary) - parseSalaryScore(a.salary));
    } else if (sortOption === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title, "vi"));
    } else {
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return list;
  }, [savedJobs, sortOption]);

  const PAGE_SIZE = 4;
  const totalJobs = sortedJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginatedJobs = sortedJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleUnsaveJob = async (jobId: string) => {
    const prev = savedJobs;
    setSavedJobs((list) => list.filter((j) => j.jobId !== jobId));
    try {
      await applicationsApi.unsaveJob(jobId);
    } catch (err) {
      setSavedJobs(prev);
      setError(err instanceof Error ? err.message : "Bỏ lưu thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <CandidateNavSidebar />
          </div>

          <div className="space-y-6 lg:col-span-9">
            <nav className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link href={ROUTES.home} className="flex items-center gap-1 transition hover:text-primary">
                <Home className="h-3.5 w-3.5" />
                <span>Trang chủ</span>
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">Việc đã lưu</span>
            </nav>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Việc đã lưu
              </h1>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Danh sách các công việc bạn đã lưu để xem lại sau.
              </p>
            </div>

            <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className="-mb-3 border-b-2 border-primary pb-3 text-xs font-bold text-primary sm:text-sm"
              >
                Tất cả ({totalJobs})
              </button>

              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value as SortOption);
                    setCurrentPage(1);
                  }}
                  className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs focus:border-primary focus:outline-none"
                >
                  <option value="newest">Mới lưu gần nhất</option>
                  <option value="salary">Mức lương cao nhất</option>
                  <option value="title">Theo tên A-Z</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải việc đã lưu...
              </div>
            ) : error ? (
              <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
                {unauthorized ? (
                  <Link
                    href={`${ROUTES.auth.login}?redirect=${encodeURIComponent(ROUTES.applications.savedJobs)}`}
                    className="inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white"
                  >
                    Đăng nhập
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => void load()}
                    className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700"
                  >
                    Thử lại
                  </button>
                )}
              </div>
            ) : paginatedJobs.length === 0 ? (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                  <Bookmark className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Chưa có việc làm nào được lưu</h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 sm:text-sm">
                  Khám phá việc làm và bấm Bookmark để lưu xem sau.
                </p>
                <div className="mt-5">
                  <Link
                    href={ROUTES.jobs}
                    className="inline-flex rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover sm:text-sm"
                  >
                    Tìm việc làm ngay
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedJobs.map((job) => (
                  <SavedJobCard
                    key={job.id}
                    job={job}
                    onApply={setApplyingJob}
                    onUnsave={handleUnsaveJob}
                  />
                ))}
              </div>
            )}

            {totalJobs > 0 && !loading && !error ? (
              <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Hiển thị {(page - 1) * PAGE_SIZE + 1} -{" "}
                  {Math.min(page * PAGE_SIZE, totalJobs)} trong {totalJobs} công việc
                </span>
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    aria-label="Trang trước"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                        pageNum === page
                          ? "bg-primary text-white shadow-2xs"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    aria-label="Trang sau"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-xs text-blue-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="leading-relaxed">
                <span className="font-bold">Lưu ý:</span> Tin hết hạn / bị gỡ có thể không còn xem
                được chi tiết từ danh sách đã lưu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {applyingJob ? (
        <ApplyModal
          isOpen={!!applyingJob}
          onClose={() => setApplyingJob(null)}
          jobId={applyingJob.jobId}
          jobTitle={applyingJob.title}
          companyName={applyingJob.companyName}
          location={applyingJob.location}
          salary={applyingJob.salary}
          onApplySuccess={() => setApplyingJob(null)}
        />
      ) : null}
    </div>
  );
}
