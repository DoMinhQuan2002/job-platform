"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Heart,
  GraduationCap,
  BarChart3,
  Megaphone,
  Settings,
  Palette,
  FolderKanban,
  AlertTriangle,
} from "lucide-react";
import {
  adminJobCategoriesApi,
  type JobCategoryItem,
  type JobCategoryStats,
  type PaginationMeta,
} from "@/services/admin-job-categories.service";
import {
  DeleteCategoryModal,
  CategoryToastContainer,
  type CategoryToastNotification,
} from "./job-category-modals";

// Dynamic Category Icon mapping
const getCategoryIcon = (name: string, slug: string) => {
  const normalized = (name + " " + slug).toLowerCase();

  if (normalized.includes("thong tin") || normalized.includes("it") || normalized.includes("phan mem")) {
    return <Monitor className="w-4 h-4 text-blue-500 shrink-0" />;
  }
  if (normalized.includes("kinh doanh") || normalized.includes("ban hang") || normalized.includes("sales")) {
    return <Briefcase className="w-4 h-4 text-blue-500 shrink-0" />;
  }
  if (normalized.includes("y te") || normalized.includes("duoc") || normalized.includes("suc khoe")) {
    return <Heart className="w-4 h-4 text-rose-500 shrink-0" />;
  }
  if (normalized.includes("giao duc") || normalized.includes("dao tao") || normalized.includes("giang day")) {
    return <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />;
  }
  if (normalized.includes("tai chinh") || normalized.includes("ngan hang") || normalized.includes("ke toan")) {
    return <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />;
  }
  if (normalized.includes("marketing") || normalized.includes("truyen thong") || normalized.includes("quang cao")) {
    return <Megaphone className="w-4 h-4 text-blue-500 shrink-0" />;
  }
  if (normalized.includes("ky thuat") || normalized.includes("co khi") || normalized.includes("xay dung") || normalized.includes("dien")) {
    return <Settings className="w-4 h-4 text-slate-500 shrink-0" />;
  }
  if (normalized.includes("thiet ke") || normalized.includes("my thuat") || normalized.includes("do hoa")) {
    return <Palette className="w-4 h-4 text-amber-600 shrink-0" />;
  }
  return <FolderKanban className="w-4 h-4 text-slate-400 shrink-0" />;
};

export function AdminJobCategoriesView() {
  const router = useRouter();

  // State
  const [items, setItems] = useState<JobCategoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [stats, setStats] = useState<JobCategoryStats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalJobs: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals & Toasts
  const [deleteTarget, setDeleteTarget] = useState<JobCategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<CategoryToastNotification[]>([]);

  const addToast = (type: "success" | "error", title: string, message: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch Stats
  useEffect(() => {
    let isIgnored = false;

    adminJobCategoriesApi
      .getStats()
      .then((data) => {
        if (!isIgnored) {
          setStats(data);
        }
      })
      .catch((err: unknown) => {
        if (!isIgnored) {
          console.error("Failed to fetch job category stats:", err);
        }
      });

    return () => {
      isIgnored = true;
    };
  }, [reloadKey]);

  // Fetch List
  useEffect(() => {
    let isIgnored = false;
    const controller = new AbortController();

    adminJobCategoriesApi
      .list(
        {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        },
        controller.signal
      )
      .then((res) => {
        if (!isIgnored) {
          setItems(res.items);
          setPagination(res.pagination);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!isIgnored && !controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách ngành nghề từ máy chủ."
          );
        }
      })
      .finally(() => {
        if (!isIgnored && !controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      isIgnored = true;
      controller.abort();
    };
  }, [pagination.page, pagination.limit, searchTerm, statusFilter, reloadKey]);

  // Handle Delete
  const handleConfirmDelete = async (category: JobCategoryItem) => {
    setIsDeleting(true);
    try {
      await adminJobCategoriesApi.remove(category.id);
      setDeleteTarget(null);
      addToast(
        "success",
        "Xóa ngành nghề thành công!",
        "Ngành nghề đã được xóa khỏi hệ thống."
      );
      setIsLoading(true);
      setReloadKey((k) => k + 1);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Xóa ngành nghề thất bại.";
      addToast("error", "Xóa ngành nghề thất bại!", msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setSearchTerm("");
    setStatusFilter("ALL");
    setPagination((prev) => ({ ...prev, page: 1 }));
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <CategoryToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* BEGIN: Page Header & CTA */}
      <section
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        data-purpose="page-header"
      >
        {/* Title & Subtitle with leading icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              Quản lý ngành nghề
            </h2>
            <p className="text-sm text-slate-500 font-normal mt-0.5">
              Quản lý danh sách các ngành nghề trên hệ thống
            </p>
          </div>
        </div>

        {/* Add Category Button */}
        <Link
          href="/admin/job-categories/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm ngành nghề</span>
        </Link>
      </section>
      {/* END: Page Header & CTA */}

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-slate-400 font-medium select-none"
      >
        <Link href="/admin" className="hover:text-slate-600 transition-colors">
          Dashboard
        </Link>
        <span>&gt;</span>
        <span className="text-slate-800 font-semibold">Quản lý ngành nghề</span>
      </nav>

      {/* BEGIN: Search & Filter Toolbar */}
      <section
        className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-xs"
        data-purpose="filter-toolbar"
      >
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Search input box */}
          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setIsLoading(true);
                setSearchTerm(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              placeholder="Tìm kiếm ngành nghề..."
              className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Trạng thái select box with floating-like label */}
          <div className="relative">
            <div className="relative min-w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setIsLoading(true);
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="appearance-none w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">Tất cả</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Làm mới</span>
        </button>
      </section>
      {/* END: Search & Filter Toolbar */}

      {/* BEGIN: Metric Summary Cards */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        data-purpose="metric-cards"
      >
        {/* Card 1: Tổng số ngành nghề */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Briefcase className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">
              Tổng số ngành nghề
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {stats.total || pagination.total}
            </p>
          </div>
        </div>

        {/* Card 2: Đang hoạt động */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Đang hoạt động</p>
            <p className="text-2xl font-bold text-slate-800">{stats.active}</p>
          </div>
        </div>

        {/* Card 3: Không hoạt động */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <AlertCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Không hoạt động</p>
            <p className="text-2xl font-bold text-slate-800">{stats.inactive}</p>
          </div>
        </div>

        {/* Card 4: Tổng tin tuyển dụng */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <FileText className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">
              Tổng tin tuyển dụng
            </p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalJobs}</p>
          </div>
        </div>
      </section>
      {/* END: Metric Summary Cards */}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="font-semibold underline hover:text-rose-950 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      )}

      {/* BEGIN: Data Table Card */}
      <section
        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
        data-purpose="data-table-card"
      >
        {/* Card Title */}
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">
            Danh sách ngành nghề
          </h3>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/75 text-xs font-semibold text-slate-700">
              <tr>
                <th className="py-3 px-6 w-16 text-center" scope="col">
                  STT
                </th>
                <th className="py-3 px-6" scope="col">
                  Tên ngành nghề
                </th>
                <th className="py-3 px-6" scope="col">
                  Slug
                </th>
                <th className="py-3 px-6 text-center" scope="col">
                  Số tin tuyển dụng
                </th>
                <th className="py-3 px-6 text-center" scope="col">
                  Trạng thái
                </th>
                <th className="py-3 px-6 text-center w-28" scope="col">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="text-xs">Đang tải danh sách ngành nghề...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderKanban className="w-10 h-10 text-slate-300" />
                      <span className="text-sm font-medium text-slate-600">
                        Không tìm thấy ngành nghề nào
                      </span>
                      <p className="text-xs text-slate-400">
                        Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc trạng thái.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((cat, idx) => {
                  const stt = (pagination.page - 1) * pagination.limit + idx + 1;
                  const isActive = cat.status === "ACTIVE";

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-6 text-center font-medium text-slate-600">
                        {stt}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(cat.name, cat.slug)}
                          <span className="font-medium text-slate-800">
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 font-normal">
                        {cat.slug}
                      </td>
                      <td className="py-3.5 px-6 text-center font-medium text-slate-700">
                        {cat.totalJobs ?? 0}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
                            <span className="w-1.5 h-1.5 mr-1.5 bg-amber-500 rounded-full" />
                            Không hoạt động
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="Chỉnh sửa ngành nghề"
                            onClick={() =>
                              router.push(`/admin/job-categories/${cat.id}/edit`)
                            }
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4 stroke-[1.8]" />
                          </button>
                          <button
                            type="button"
                            title="Xóa ngành nghề"
                            onClick={() => setDeleteTarget(cat)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded border border-red-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.8]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* BEGIN: Pagination Footer */}
        <div
          className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 text-sm"
          data-purpose="table-pagination"
        >
          {/* Rows per page selector */}
          <div className="flex items-center gap-2 text-slate-500">
            <span>Hiển thị</span>
            <div className="relative">
              <select
                value={pagination.limit}
                onChange={(e) => {
                  setIsLoading(true);
                  setPagination((prev) => ({
                    ...prev,
                    limit: Number(e.target.value),
                    page: 1,
                  }));
                }}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-7 py-1 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-500">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
            <span>trên mỗi trang</span>
          </div>

          {/* Page Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => {
                setIsLoading(true);
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, and pages around current page
                if (pagination.totalPages <= 7) return true;
                return (
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.page) <= 1
                );
              })
              .map((p, idx, arr) => {
                const isCurrent = p === pagination.page;
                const prevP = arr[idx - 1];
                const showEllipsis = prevP && p - prevP > 1;

                return (
                  <React.Fragment key={p}>
                    {showEllipsis && (
                      <span className="w-8 text-center text-xs text-slate-400">
                        ...
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!isCurrent) {
                          setIsLoading(true);
                          setPagination((prev) => ({ ...prev, page: p }));
                        }
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        isCurrent
                          ? "bg-blue-600 text-white shadow-xs"
                          : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            {/* Next Button */}
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => {
                setIsLoading(true);
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* END: Pagination Footer */}
      </section>
      {/* END: Data Table Card */}

      {/* Delete Confirmation Modal */}
      <DeleteCategoryModal
        category={deleteTarget}
        isOpen={Boolean(deleteTarget)}
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
