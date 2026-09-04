"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, ChevronRight, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import {
  adminJobsApi,
  type AdminJobListItem,
  type AdminJobsResponse,
  type CompanyOption,
  type JobCategoryOption,
} from "@/services/admin-jobs.service";
import { adminStatisticsService } from "@/services/admin-statistics.service";
import { JobStatusTabs, type JobStatusTabValue } from "./job-status-tabs";
import { JobFilterCard, type JobFilterValues } from "./job-filter-card";
import { JobTable } from "./job-table";
import { JobTablePagination } from "./job-table-pagination";
import { ApproveModal, RejectModal, DeleteModal } from "./job-action-modals";
import { JobTableSkeleton } from "./job-table-skeleton";

type ToastNotification = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

export function AdminJobsView() {
  const router = useRouter();

  // Filters & State
  const [activeTab, setActiveTab] = useState<JobStatusTabValue>("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterValues, setFilterValues] = useState<JobFilterValues>({
    search: "",
    companyId: "",
    status: "",
    categoryId: "",
    startDate: "",
    endDate: "",
  });

  // Data & Loading
  const [data, setData] = useState<AdminJobsResponse | null>(null);
  const [categories, setCategories] = useState<JobCategoryOption[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [tabCounts, setTabCounts] = useState<Record<JobStatusTabValue, number>>({
    ALL: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    CLOSED: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [approveJob, setApproveJob] = useState<AdminJobListItem | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const [rejectJob, setRejectJob] = useState<AdminJobListItem | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  const [deleteJob, setDeleteJob] = useState<AdminJobListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((type: "success" | "error" | "info", message: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Fetch categories and companies for filters
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      adminJobsApi.listCategories(controller.signal),
      adminJobsApi.listCompanies(controller.signal),
    ])
      .then(([catList, compList]) => {
        setCategories(catList);
        setCompanies(compList);
      })
      .catch(() => {
        // Handled silently
      });

    return () => {
      controller.abort();
    };
  }, []);

  // Fetch tab counts from statistics API
  useEffect(() => {
    adminStatisticsService
      .getOverview()
      .then((overview) => {
        if (overview?.jobStatusDistribution) {
          const dist = overview.jobStatusDistribution;
          setTabCounts({
            ALL: dist.total ?? 0,
            PENDING: dist.pending?.count ?? 0,
            APPROVED: dist.open?.count ?? 0,
            REJECTED: dist.rejected?.count ?? 0,
            CLOSED: dist.closed?.count ?? 0,
          });
        }
      })
      .catch(() => {
        // Handled silently
      });
  }, [reloadKey]);

  // Fetch jobs
  useEffect(() => {
    let isIgnored = false;
    const controller = new AbortController();

    // Determine query status: activeTab overrides or filterValues
    const queryStatus =
      activeTab !== "ALL"
        ? activeTab
        : filterValues.status
          ? filterValues.status
          : undefined;

    adminJobsApi
      .list(
        {
          page,
          limit,
          search: filterValues.search || undefined,
          status: queryStatus,
          companyId: filterValues.companyId || undefined,
          categoryId: filterValues.categoryId || undefined,
        },
        controller.signal
      )
      .then((res) => {
        if (!isIgnored) {
          setData(res);
          setError(null);
          // Update active tab count with fresh total
          setTabCounts((prev) => ({
            ...prev,
            [activeTab]: res.pagination.total,
          }));
        }
      })
      .catch((err: unknown) => {
        if (!isIgnored && !controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách tin tuyển dụng từ máy chủ."
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
  }, [activeTab, page, limit, filterValues, reloadKey]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      ALL: tabCounts.ALL,
      PENDING: tabCounts.PENDING,
      APPROVED: tabCounts.APPROVED,
      REJECTED: tabCounts.REJECTED,
      CLOSED: tabCounts.CLOSED,
    };
  }, [tabCounts]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (!data?.items) return;
    const allIds = data.items.map((j) => j.id);
    const isAllSelected = allIds.every((id) => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  // Filter handlers
  const handleFilter = (newValues: JobFilterValues) => {
    setIsLoading(true);
    setSelectedIds([]);
    setFilterValues(newValues);
    setPage(1);
    if (newValues.status) {
      setActiveTab(newValues.status);
    }
  };

  const handleResetFilters = () => {
    setIsLoading(true);
    setSelectedIds([]);
    setFilterValues({
      search: "",
      companyId: "",
      status: "",
      categoryId: "",
      startDate: "",
      endDate: "",
    });
    setActiveTab("ALL");
    setPage(1);
  };

  const handleTabChange = (tab: JobStatusTabValue) => {
    setIsLoading(true);
    setSelectedIds([]);
    setActiveTab(tab);
    setPage(1);
    if (tab !== "ALL") {
      setFilterValues((prev) => ({ ...prev, status: tab }));
    } else {
      setFilterValues((prev) => ({ ...prev, status: "" }));
    }
  };

  // Action modal triggers
  const handleOpenDetail = (job: AdminJobListItem) => {
    router.push(`/admin/jobs/${job.id}`);
  };

  const handleOpenApprove = (job: AdminJobListItem) => {
    setApproveJob(job);
  };

  const handleOpenReject = (job: AdminJobListItem) => {
    setRejectJob(job);
  };

  const handleOpenDelete = (job: AdminJobListItem) => {
    setDeleteJob(job);
  };

  // Action modal executions
  const handleConfirmApprove = async (job: AdminJobListItem) => {
    setIsApproving(true);
    try {
      await adminJobsApi.approve(job.id);
      addToast("success", `Đã phê duyệt tin tuyển dụng "${job.title}" thành công.`);
      setApproveJob(null);
      setReloadKey((k) => k + 1);
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Phê duyệt tin tuyển dụng thất bại."
      );
    } finally {
      setIsApproving(false);
    }
  };

  const handleConfirmReject = async (job: AdminJobListItem, reason: string) => {
    setIsRejecting(true);
    try {
      await adminJobsApi.reject(job.id, reason);
      addToast(
        "success",
        `Đã từ chối tin tuyển dụng "${job.title}". Lý do đã được gửi đến nhà tuyển dụng.`
      );
      setRejectJob(null);
      setReloadKey((k) => k + 1);
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Từ chối tin tuyển dụng thất bại."
      );
    } finally {
      setIsRejecting(false);
    }
  };

  const handleConfirmDelete = async (job: AdminJobListItem) => {
    setIsDeleting(true);
    try {
      await adminJobsApi.remove(job.id);
      addToast("success", `Đã xóa tin tuyển dụng "${job.title}" khỏi hệ thống.`);
      setDeleteJob(null);
      setReloadKey((k) => k + 1);
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Xóa tin tuyển dụng thất bại."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const pagination = data?.pagination ?? {
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications container */}
      {toasts.length > 0 && (
        <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium animate-toastIn ${
                t.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : t.type === "error"
                    ? "bg-rose-50 text-rose-900 border-rose-200"
                    : "bg-blue-50 text-blue-900 border-blue-200"
              }`}
            >
              {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {t.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {t.type === "info" && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center text-[13px] text-slate-400 font-medium select-none"
      >
        <span>Quản lý tuyển dụng</span>
        <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-400" />
        <span className="text-slate-700">Danh sách tin tuyển dụng</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quản lý tin tuyển dụng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Xem xét, phê duyệt hoặc quản lý các tin đăng tuyển dụng trên toàn hệ thống.
          </p>
        </div>
      </div>

      {/* Filter Card */}
      <JobFilterCard
        categories={categories}
        companies={companies}
        initialValues={filterValues}
        onFilter={handleFilter}
        onReset={handleResetFilters}
      />

      {/* Status Filter Tabs */}
      <JobStatusTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={counts}
      />

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setReloadKey((k) => k + 1);
            }}
            className="font-semibold underline hover:text-rose-950 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      )}

      {/* Table Section */}
      {isLoading ? (
        <JobTableSkeleton />
      ) : (
        <section
          className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs"
          data-purpose="job-postings-table"
        >
          <JobTable
            jobs={data?.items ?? []}
            startIndex={(pagination.page - 1) * pagination.limit}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onViewDetail={handleOpenDetail}
            onDelete={handleOpenDelete}
            onApprove={handleOpenApprove}
            onReject={handleOpenReject}
          />

          <JobTablePagination
            page={pagination.page}
            limit={limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => {
              setIsLoading(true);
              setPage(newPage);
            }}
            onLimitChange={(newLimit) => {
              setIsLoading(true);
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </section>
      )}

      {/* Modals */}
      <ApproveModal
        job={approveJob}
        isOpen={Boolean(approveJob)}
        isLoading={isApproving}
        onClose={() => setApproveJob(null)}
        onConfirm={handleConfirmApprove}
      />

      <RejectModal
        job={rejectJob}
        isOpen={Boolean(rejectJob)}
        isLoading={isRejecting}
        onClose={() => setRejectJob(null)}
        onConfirm={handleConfirmReject}
      />

      <DeleteModal
        job={deleteJob}
        isOpen={Boolean(deleteJob)}
        isLoading={isDeleting}
        onClose={() => setDeleteJob(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
