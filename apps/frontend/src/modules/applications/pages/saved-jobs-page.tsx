"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import {
  ChevronRight,
  Home,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Bookmark,
} from "lucide-react";
import type { SavedJob } from "../types";
import { CandidateNavSidebar } from "../components/candidate-nav-sidebar";
import { SavedJobCard } from "../components/saved-job-card";
import { ApplyModal } from "../components/apply-modal";
import { applicationsApi } from "../api";

const INITIAL_SAVED_JOBS: SavedJob[] = [
  {
    id: "saved-1",
    jobId: "job-marketing-1",
    title: "Chuyên viên Digital Marketing",
    companyName: "Công ty Cổ phần FPT",
    location: "Hà Nội",
    experience: "2 - 4 năm",
    salary: "15 - 20 triệu VND",
    category: "Marketing",
    savedDate: "20/05/2024",
  },
  {
    id: "saved-2",
    jobId: "job-shopee-sales-1",
    title: "Nhân viên Kinh doanh",
    companyName: "Shopee Việt Nam",
    location: "Hồ Chí Minh",
    experience: "1 - 2 năm",
    salary: "12 - 18 triệu VND",
    category: "Kinh doanh",
    savedDate: "18/05/2024",
  },
  {
    id: "saved-3",
    jobId: "job-vpbank-data-1",
    title: "Chuyên viên Phân tích dữ liệu (Data Analyst)",
    companyName: "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)",
    location: "Hà Nội",
    experience: "2 - 3 năm",
    salary: "18 - 25 triệu VND",
    category: "IT - Phần mềm",
    savedDate: "15/05/2024",
  },
  {
    id: "saved-4",
    jobId: "job-vnpt-system-1",
    title: "Kỹ sư Hệ thống",
    companyName: "Tập đoàn Bưu chính Viễn thông Việt Nam (VNPT)",
    location: "Đà Nẵng",
    experience: "2 - 5 năm",
    salary: "15 - 22 triệu VND",
    category: "IT - Phần mềm",
    savedDate: "12/05/2024",
  },
  {
    id: "saved-5",
    jobId: "job-fe-reactjs-1",
    title: "Frontend Developer (ReactJS)",
    companyName: "FPT Software",
    location: "Hà Nội",
    experience: "2 - 4 năm",
    salary: "20 - 30 triệu VND",
    category: "IT - Phần mềm",
    savedDate: "10/05/2024",
  },
  {
    id: "saved-6",
    jobId: "job-viettel-dev-1",
    title: "JavaScript Developer",
    companyName: "Viettel Solutions",
    location: "Hà Nội",
    experience: "1 - 3 năm",
    salary: "15 - 25 triệu VND",
    category: "IT - Phần mềm",
    savedDate: "05/05/2024",
  },
];

export function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(INITIAL_SAVED_JOBS);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("newest");
  const [applyingJob, setApplyingJob] = useState<SavedJob | null>(null);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await applicationsApi.listSavedJobs();
        if (res && Array.isArray(res.data)) {
          const mapped: SavedJob[] = res.data.map((item: Record<string, unknown>, idx: number) => {
            const jobObj = (item.job as Record<string, unknown>) || {};
            const companyObj = (jobObj.company as Record<string, unknown>) || {};
            return {
              id: String(item.id || `saved-${idx}`),
              jobId: String(item.jobId || item.job_id || `job-${idx}`),
              title: String(item.title || jobObj.title || "Công việc đã lưu"),
              companyName: String(item.companyName || companyObj.name || "Nhà tuyển dụng"),
              location: String(item.location || jobObj.location || "Toàn quốc"),
              experience: String(item.experience || jobObj.experience || "Kinh nghiệm phù hợp"),
              salary: String(item.salary || jobObj.salary || "Thỏa thuận"),
              category: String(item.category || jobObj.category || "Tuyển dụng"),
              savedDate: item.savedDate
                ? String(item.savedDate)
                : item.createdAt
                ? new Date(String(item.createdAt)).toLocaleDateString("vi-VN")
                : "Hôm nay",
            };
          });
          setSavedJobs(mapped);
        }
      } catch {
        // In case not logged in or backend error, keep INITIAL_SAVED_JOBS for UI preview
      }
    };


    fetchSavedJobs();
  }, []);


  const PAGE_SIZE = 4;
  const totalJobs = savedJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));

  const paginatedJobs = savedJobs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleUnsaveJob = async (jobId: string) => {
    try {
      await applicationsApi.unsaveJob(jobId);
    } catch {
      // Optimistic update
    }
    setSavedJobs((prev) => prev.filter((j) => j.jobId !== jobId));
  };



  const handleApplyJob = (job: SavedJob) => {
    setApplyingJob(job);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Candidate Nav Sidebar */}
          <div className="lg:col-span-3">
            <CandidateNavSidebar />
          </div>

          {/* Right: Main Saved Jobs List */}
          <div className="space-y-6 lg:col-span-9">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/" className="flex items-center gap-1 hover:text-primary transition">
                <Home className="h-3.5 w-3.5" />
                <span>Trang chủ</span>
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">Việc đã lưu</span>
            </nav>

            {/* Header */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Việc đã lưu
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Danh sách các công việc bạn đã lưu để xem lại sau.
              </p>
            </div>

            {/* Tab & Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-3">
              {/* Tab */}
              <div className="flex items-center gap-6">
                <button className="font-bold text-xs sm:text-sm text-primary pb-3 -mb-3 border-b-2 border-primary">
                  Tất cả ({totalJobs})
                </button>
              </div>

              {/* Sort dropdown */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs focus:border-primary focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Mới lưu gần nhất</option>
                    <option value="salary">Mức lương cao nhất</option>
                    <option value="deadline">Sắp hết hạn</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
              {paginatedJobs.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary mb-3">
                    <Bookmark className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Chưa có việc làm nào được lưu</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Khám phá hàng ngàn cơ hội việc làm hấp dẫn và bấm biểu tượng Bookmark để lưu lại xem sau.
                  </p>
                  <div className="mt-5">
                    <Link href="/jobs">
                      <button className="rounded-xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary-hover shadow-xs">
                        Tìm việc làm ngay
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                paginatedJobs.map((job) => (
                  <SavedJobCard
                    key={job.id}
                    job={job}
                    onApply={handleApplyJob}
                    onUnsave={handleUnsaveJob}
                  />
                ))
              )}
            </div>

            {/* Pagination bar */}
            {totalJobs > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                <span className="text-xs text-slate-500 font-medium">
                  Hiển thị {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
                  {Math.min(currentPage * PAGE_SIZE, totalJobs)} trong {totalJobs} công việc
                </span>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
                    aria-label="Trang trước"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                          isActive
                            ? "bg-primary text-white shadow-2xs"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
                    aria-label="Trang sau"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Info Banner */}
            <div className="flex items-start gap-3 rounded-2xl bg-blue-50/80 p-4 text-xs text-blue-900 border border-blue-100">
              <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-bold">Lưu ý:</span> Công việc sẽ được tự động xóa khỏi danh sách nếu nhà tuyển dụng gỡ tin hoặc đã hết hạn tuyển dụng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {applyingJob && (
        <ApplyModal
          isOpen={!!applyingJob}
          onClose={() => setApplyingJob(null)}
          jobId={applyingJob.jobId}
          jobTitle={applyingJob.title}
          companyName={applyingJob.companyName}
          location={applyingJob.location}
          salary={applyingJob.salary}
          onApplySuccess={() => {
            alert(`Đã gửi hồ sơ ứng tuyển vị trí: ${applyingJob.title}`);
          }}
        />
      )}
    </div>
  );
}
