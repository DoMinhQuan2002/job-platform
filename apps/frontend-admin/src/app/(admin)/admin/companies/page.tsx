"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  LockKeyhole,
  Plus,
  Search,
  UnlockKeyhole,
  X,
} from "lucide-react";
import {
  adminCompaniesApi,
  type AdminCompany,
  type AdminCompaniesResponse,
  type CompanyStatus,
} from "@/services/admin-companies.service";

const statusLabels: Record<CompanyStatus, string> = {
  PENDING: "Chờ duyệt",
  ACTIVE: "Đang hoạt động",
  REJECTED: "Bị từ chối",
  BLOCKED: "Đang bị khóa",
};

const statusStyles: Record<CompanyStatus, string> = {
  PENDING: "bg-amber-50 text-amber-600 ring-amber-100",
  ACTIVE: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  REJECTED: "bg-red-50 text-red-500 ring-red-100",
  BLOCKED: "bg-red-50 text-red-500 ring-red-100",
};

const avatarColors = [
  "bg-blue-600",
  "bg-red-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-emerald-600",
  "bg-sky-500",
  "bg-violet-500",
  "bg-cyan-600",
];

const statusOptions: Array<{ label: string; value: CompanyStatus | "ALL" }> = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ duyệt", value: "PENDING" },
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Đang bị khóa", value: "BLOCKED" },
  { label: "Bị từ chối", value: "REJECTED" },
];

type CompanyStats = {
  total: number;
  active: number;
  blocked: number;
  newThisMonth: number;
};

type CompanyLockAction = "lock" | "unlock";

const LIST_CACHE_TTL_MS = 30 * 1000;
const LIST_CACHE_STORAGE_KEY = "jp_admin_companies_list_cache";

type CompaniesListCache = {
  key: string;
  data: AdminCompaniesResponse;
  expiresAt: number;
};

let companiesListCache: CompaniesListCache | null = null;

const getListCacheKey = ({
  page,
  limit,
  search,
  status,
  createdFrom,
  createdTo,
}: {
  page: number;
  limit: number;
  search: string;
  status: CompanyStatus | "ALL";
  createdFrom: string;
  createdTo: string;
}) => `${page}:${limit}:${search.trim()}:${status}:${createdFrom}:${createdTo}`;

const readCachedList = (key: string) => {
  const memoryCache = companiesListCache;

  if (
    memoryCache?.key === key &&
    memoryCache.expiresAt > Date.now() &&
    memoryCache.data.stats
  ) {
    return memoryCache.data;
  }

  if (typeof window === "undefined") return null;

  try {
    const stored = window.sessionStorage.getItem(LIST_CACHE_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as CompaniesListCache;
    if (parsed.key !== key || parsed.expiresAt <= Date.now()) return null;
    if (!parsed.data?.stats) return null;

    companiesListCache = parsed;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCachedList = (key: string, data: AdminCompaniesResponse) => {
  const cacheEntry = {
    key,
    data,
    expiresAt: Date.now() + LIST_CACHE_TTL_MS,
  };

  companiesListCache = cacheEntry;

  try {
    window.sessionStorage.setItem(
      LIST_CACHE_STORAGE_KEY,
      JSON.stringify(cacheEntry),
    );
  } catch {
  }
};

const clearCachedList = () => {
  companiesListCache = null;

  try {
    window.sessionStorage.removeItem(LIST_CACHE_STORAGE_KEY);
  } catch {
  }
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

function StatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${statusStyles[status]}`}
    >
      <span
        className={`size-1.5 rounded-full ${
          status === "ACTIVE" ? "bg-emerald-500" : "bg-current"
        }`}
      />
      {statusLabels[status]}
    </span>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-slate-100" />
              <div className="h-4 w-40 rounded bg-slate-100" />
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-24 rounded bg-slate-100" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-36 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
          </td>
          <td className="px-4 py-4">
            <div className="h-6 w-28 rounded-full bg-slate-100" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-24 rounded bg-slate-100" />
          </td>
          <td className="px-4 py-4">
            <div className="ml-auto h-8 w-16 rounded bg-slate-100" />
          </td>
        </tr>
      ))}
    </>
  );
}

function CompanyLockDialog({
  action,
  companyName,
  reason,
  error,
  processing,
  onReasonChange,
  onClose,
  onConfirm,
}: {
  action: CompanyLockAction;
  companyName: string;
  reason: string;
  error: string | null;
  processing: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isLock = action === "lock";
  const config = isLock
    ? {
        title: "Khóa tài khoản công ty",
        body: "Bạn có chắc chắn muốn khóa tài khoản công ty này? Công ty sẽ không thể đăng nhập và sử dụng hệ thống.",
        confirm: "Xác nhận khóa",
        confirmClass: "bg-red-600 hover:bg-red-700",
        icon: LockKeyhole,
        iconClass: "bg-red-50 text-red-600",
      }
    : {
        title: "Xác nhận mở khóa tài khoản",
        body: `Bạn có chắc chắn muốn mở khóa tài khoản ${companyName}? Sau khi mở khóa, công ty có thể đăng nhập và sử dụng hệ thống như bình thường.`,
        confirm: "Xác nhận mở khóa",
        confirmClass: "bg-blue-700 hover:bg-blue-800",
        icon: UnlockKeyhole,
        iconClass: "bg-blue-50 text-blue-700",
      };
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
      <section className="w-full max-w-[430px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">{config.title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            title="Đóng"
            className="grid size-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="px-5 py-5">
          {isLock ? (
            <>
              <p className="text-sm leading-6 text-slate-600">{config.body}</p>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-slate-700">
                  Lý do khóa tài khoản <span className="text-red-500">*</span>
                </span>
                <span className="mt-2 block rounded-lg border border-slate-200 bg-slate-50 p-3 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                  <textarea
                    value={reason}
                    onChange={(event) => onReasonChange(event.target.value)}
                    maxLength={500}
                    rows={5}
                    placeholder="Nhập lý do khóa tài khoản (từ 10 đến 500 ký tự)..."
                    className="min-h-28 w-full resize-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                  <span className="block text-right text-xs text-slate-500">
                    {reason.length}/500
                  </span>
                </span>
              </label>
            </>
          ) : (
            <div className="text-center">
              <span
                className={`mx-auto grid size-12 place-items-center rounded-full ${config.iconClass}`}
              >
                <Icon className="size-6" />
              </span>
              <p className="mx-auto mt-4 max-w-sm text-sm font-semibold leading-6 text-slate-800">
                {config.body}
              </p>
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-3 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="inline-flex h-10 min-w-28 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={processing}
            className={`inline-flex h-10 min-w-36 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${config.confirmClass}`}
          >
            {processing && <Loader2 className="size-4 animate-spin" />}
            {processing ? "Đang xử lý..." : config.confirm}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default function AdminCompaniesPage() {
  const [initialList] = useState(() =>
    readCachedList(
      getListCacheKey({
        page: 1,
        limit: 10,
        search: "",
        status: "ALL",
        createdFrom: "",
        createdTo: "",
      }),
    ),
  );
  const [companies, setCompanies] = useState<AdminCompany[]>(
    () => initialList?.items ?? [],
  );
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<CompanyStatus | "ALL">("ALL");
  const [appliedStatus, setAppliedStatus] = useState<CompanyStatus | "ALL">("ALL");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [appliedCreatedFrom, setAppliedCreatedFrom] = useState("");
  const [appliedCreatedTo, setAppliedCreatedTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(() => initialList?.pagination.total ?? 0);
  const [totalPages, setTotalPages] = useState(
    () => initialList?.pagination.totalPages ?? 1,
  );
  const [counts, setCounts] = useState<CompanyStats>(
    () =>
      initialList?.stats ?? {
        total: 0,
        active: 0,
        blocked: 0,
        newThisMonth: 0,
      },
  );
  const [loading, setLoading] = useState(() => !initialList);
  const [statsLoading, setStatsLoading] = useState(() => !initialList);
  const [error, setError] = useState<string | null>(null);
  const [updatingCompanyId, setUpdatingCompanyId] = useState<string | null>(null);
  const [lockDialogCompany, setLockDialogCompany] = useState<AdminCompany | null>(null);
  const [lockReason, setLockReason] = useState("");
  const [lockActionError, setLockActionError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const cacheKey = getListCacheKey({
      page,
      limit,
      search: appliedSearch,
      status: appliedStatus,
      createdFrom: appliedCreatedFrom,
      createdTo: appliedCreatedTo,
    });

    const fetchCompanies = async () => {
      try {
        const cachedList = readCachedList(cacheKey);

        if (cachedList) {
          setCompanies(cachedList.items);
          setTotal(cachedList.pagination.total);
          setTotalPages(cachedList.pagination.totalPages);
          setCounts(cachedList.stats);
          setStatsLoading(false);
        }

        setLoading(!cachedList);
        setError(null);

        const result = await adminCompaniesApi.list(
          {
            page,
            limit,
            search: appliedSearch,
            status: appliedStatus,
            createdFrom: appliedCreatedFrom,
            createdTo: appliedCreatedTo,
          },
          { signal: controller.signal },
        );

        if (ignore) return;

        writeCachedList(cacheKey, result);
        setCompanies(result.items);
        setTotal(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
        setCounts(result.stats);
        setStatsLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách công ty",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setStatsLoading(false);
        }
      }
    };

    fetchCompanies();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [appliedCreatedFrom, appliedCreatedTo, appliedSearch, appliedStatus, limit, page]);

  const stats = useMemo(
    () => [
      {
        title: "Tổng công ty",
        value: counts.total.toLocaleString("vi-VN"),
        subtitle: "Tất cả công ty",
        icon: Building2,
        iconColor: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Đang hoạt động",
        value: counts.active.toLocaleString("vi-VN"),
        subtitle:
          counts.total > 0
            ? `${((counts.active / counts.total) * 100).toFixed(1)}% tổng số`
            : "0% tổng số",
        icon: CheckCircle2,
        iconColor: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        title: "Đang bị khóa",
        value: counts.blocked.toLocaleString("vi-VN"),
        subtitle:
          counts.total > 0
            ? `${((counts.blocked / counts.total) * 100).toFixed(1)}% tổng số`
            : "0% tổng số",
        icon: LockKeyhole,
        iconColor: "text-amber-600",
        bgColor: "bg-amber-50",
      },
      {
        title: "Mới trong tháng",
        value: counts.newThisMonth.toLocaleString("vi-VN"),
        subtitle: "Trong 30 ngày qua",
        icon: Plus,
        iconColor: "text-purple-600",
        bgColor: "bg-purple-50",
      },
    ],
    [counts],
  );

  const applyFilters = () => {
    setPage(1);
    setAppliedSearch(search);
    setAppliedStatus(status);
    setAppliedCreatedFrom(createdFrom);
    setAppliedCreatedTo(createdTo);
  };

  const clearFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setStatus("ALL");
    setAppliedStatus("ALL");
    setCreatedFrom("");
    setCreatedTo("");
    setAppliedCreatedFrom("");
    setAppliedCreatedTo("");
    setPage(1);
  };

  const openLockDialog = (company: AdminCompany) => {
    if (company.status !== "ACTIVE" && company.status !== "BLOCKED") return;

    setLockDialogCompany(company);
    setLockReason("");
    setLockActionError(null);
  };

  const closeLockDialog = () => {
    if (updatingCompanyId) return;

    setLockDialogCompany(null);
    setLockReason("");
    setLockActionError(null);
  };

  const confirmLockDialog = async () => {
    if (!lockDialogCompany) return;

    const nextStatus =
      lockDialogCompany.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const trimmedReason = lockReason.trim();

    if (
      nextStatus === "BLOCKED" &&
      (trimmedReason.length < 10 || trimmedReason.length > 500)
    ) {
      setLockActionError("Lý do phải từ 10 đến 500 ký tự.");
      return;
    }

    try {
      setUpdatingCompanyId(lockDialogCompany.id);
      setError(null);
      setLockActionError(null);
      const updated = await adminCompaniesApi.updateStatus(lockDialogCompany.id, {
        status: nextStatus,
        reason: nextStatus === "BLOCKED" ? trimmedReason : undefined,
      });

      setCompanies((current) =>
        current
          .map((item) =>
            item.id === lockDialogCompany.id
              ? {
                  ...item,
                  status: updated.status,
                  rejectReason: updated.rejectReason ?? null,
                }
              : item,
          )
          .filter((item) => appliedStatus === "ALL" || item.status === appliedStatus),
      );
      setCounts((current) => ({
        ...current,
        active:
          nextStatus === "ACTIVE"
            ? current.active + 1
            : Math.max(current.active - 1, 0),
        blocked:
          nextStatus === "BLOCKED"
            ? current.blocked + 1
            : Math.max(current.blocked - 1, 0),
      }));
      if (appliedStatus !== "ALL" && appliedStatus !== nextStatus) {
        setTotal((current) => Math.max(current - 1, 0));
      }
      clearCachedList();
      setLockDialogCompany(null);
      setLockReason("");
    } catch (err) {
      setLockActionError(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật trạng thái công ty",
      );
    } finally {
      setUpdatingCompanyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý công ty"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Quản lý công ty" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const showStatsSkeleton = statsLoading;

          return (
            <div
              key={stat.title}
              className="flex min-h-[108px] items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div
                className={`grid size-12 shrink-0 place-items-center rounded-full ${stat.bgColor} ${stat.iconColor}`}
              >
                <Icon className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">{stat.title}</p>
                {showStatsSkeleton ? (
                  <>
                    <div className="mt-2 h-7 w-14 animate-pulse rounded bg-slate-100" />
                    <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-100" />
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {stat.subtitle}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[minmax(240px,1fr)_160px_150px_150px_auto_auto] lg:items-end">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">Tìm kiếm</span>
            <span className="relative block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyFilters();
                }}
                placeholder="Tìm theo tên công ty, MST, email..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </span>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">Trạng thái</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as CompanyStatus | "ALL")
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">Từ ngày</span>
            <span className="relative block">
              <input
                type="date"
                value={createdFrom}
                onChange={(event) => setCreatedFrom(event.target.value)}
                placeholder="Chọn khoảng ngày"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <Calendar className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </span>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">Đến ngày</span>
            <span className="relative block">
              <input
                type="date"
                value={createdTo}
                onChange={(event) => setCreatedTo(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <Calendar className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </span>
          </label>

          <button
            type="button"
            onClick={applyFilters}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-100 px-5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-200"
          >
            <Filter className="size-4" />
            Lọc
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="h-10 rounded-lg px-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
          >
            Xóa bộ lọc
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            <AlertCircle className="size-4" />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-4">Công ty</th>
                <th className="px-4 py-4">MST</th>
                <th className="px-4 py-4">Email / SĐT</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-4 py-4">Ngày tạo</th>
                <th className="px-4 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <TableSkeleton />
              ) : companies.length > 0 ? (
                companies.map((company, index) => (
                  <tr
                    key={company.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid size-9 shrink-0 place-items-center rounded-full ${
                            avatarColors[index % avatarColors.length]
                          } text-xs font-bold text-white shadow-xs`}
                        >
                          {getInitials(company.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {company.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {company.totalJobs} tin tuyển dụng
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {company.taxCode || "--"}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-800">{company.email}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {company.phone}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={company.status} />
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(company.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1 text-slate-500">
                        <Link
                          href={`/admin/companies/${company.id}`}
                          title="Xem chi tiết"
                          className="grid size-8 place-items-center rounded-lg transition-colors hover:bg-slate-100 hover:text-slate-800"
                        >
                          <Eye className="size-4" />
                        </Link>
                        <button
                          type="button"
                          title={
                            company.status === "ACTIVE"
                              ? "Khóa công ty"
                              : company.status === "BLOCKED"
                                ? "Mở khóa công ty"
                                : "Chỉ khóa/mở khóa công ty đang hoạt động hoặc bị khóa"
                          }
                          disabled={
                            updatingCompanyId === company.id ||
                            (company.status !== "ACTIVE" && company.status !== "BLOCKED")
                          }
                          onClick={() => openLockDialog(company)}
                          className="grid size-8 place-items-center rounded-lg transition-colors hover:bg-slate-100 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                        >
                          {updatingCompanyId === company.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : company.status === "BLOCKED" ? (
                            <UnlockKeyhole className="size-4" />
                          ) : (
                            <LockKeyhole className="size-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Building2 className="mx-auto size-10 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      Không có công ty phù hợp
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-slate-700 outline-none focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>trong số {total.toLocaleString("vi-VN")}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Trang trước"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              className="grid size-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            {[...Array(Math.min(totalPages, 3))].map((_, index) => {
              const pageNumber = index + 1;

              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  disabled={loading}
                  className={`grid size-8 place-items-center rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    page === pageNumber
                      ? "bg-blue-700 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            {totalPages > 3 && <span className="px-2 text-slate-400">...</span>}
            <button
              type="button"
              title="Trang sau"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((current) => Math.min(current + 1, totalPages))
              }
              className="grid size-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          </div>
        </div>
      </section>

      {lockDialogCompany && (
        <CompanyLockDialog
          action={lockDialogCompany.status === "ACTIVE" ? "lock" : "unlock"}
          companyName={lockDialogCompany.name}
          reason={lockReason}
          error={lockActionError}
          processing={updatingCompanyId === lockDialogCompany.id}
          onReasonChange={(value) => {
            setLockReason(value);
            if (lockActionError) setLockActionError(null);
          }}
          onClose={closeLockDialog}
          onConfirm={confirmLockDialog}
        />
      )}
    </div>
  );
}
