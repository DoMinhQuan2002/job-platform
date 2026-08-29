"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileDown,
  Filter,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Search,
  UserCheck,
  UserRoundX,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  recruiterApplicationsApi,
  type RecruiterApplication,
  type RecruiterApplicationStatus,
} from "@/services/recruiter-applications.service";
import { ROUTES } from "@/constants/routes";

const statusLabels: Record<RecruiterApplicationStatus, string> = {
  APPLIED: "Đã nộp",
  VIEWED: "HR đã xem",
  INTERVIEW: "Mời phỏng vấn",
  ACCEPTED: "Trúng tuyển",
  REJECTED: "Không đạt",
  WITHDRAWN: "Đã rút",
};

const statusStyles: Record<RecruiterApplicationStatus, string> = {
  APPLIED: "bg-blue-50 text-blue-700 border-blue-100",
  VIEWED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  INTERVIEW: "bg-amber-50 text-amber-700 border-amber-100",
  ACCEPTED: "bg-violet-50 text-violet-700 border-violet-100",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
  WITHDRAWN: "bg-slate-100 text-slate-600 border-slate-200",
};

const writableStatuses: Array<Exclude<RecruiterApplicationStatus, "WITHDRAWN">> = [
  "APPLIED",
  "VIEWED",
  "INTERVIEW",
  "ACCEPTED",
  "REJECTED",
];

const filterStatuses: Array<{ value: RecruiterApplicationStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "APPLIED", label: "Đã nộp" },
  { value: "VIEWED", label: "HR đã xem" },
  { value: "INTERVIEW", label: "Mời phỏng vấn" },
  { value: "ACCEPTED", label: "Trúng tuyển" },
  { value: "REJECTED", label: "Không đạt" },
  { value: "WITHDRAWN", label: "Đã rút" },
];

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
};

const formatTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const getCandidateName = (item: RecruiterApplication) =>
  item.candidate?.fullName || `Ứng viên #${item.candidateId}`;

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "UV";

function statusBadge(status: RecruiterApplicationStatus) {
  return (
    <span className={`inline-flex min-w-[86px] justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
};

function StatCard({ label, value, hint, icon: Icon, tone }: StatCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-full ${tone}`}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted">{label}</p>
          <strong className="block text-2xl font-bold leading-tight text-text">{value}</strong>
          <span className="text-[11px] font-medium text-muted">{hint}</span>
        </div>
      </div>
    </article>
  );
}

export function RecruiterCandidatesPage() {
  const [items, setItems] = useState<RecruiterApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [jobId, setJobId] = useState("ALL");
  const [status, setStatus] = useState<RecruiterApplicationStatus | "ALL">("ALL");
  const [fromDate, setFromDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await recruiterApplicationsApi.list(undefined, signal);
      if (signal?.aborted) return;
      setItems(response.data ?? []);
    } catch (requestError) {
      if (signal?.aborted) return;
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải danh sách ứng viên.",
      );
      setItems([]);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => void load(controller.signal));
    return () => controller.abort();
  }, [load]);

  const jobOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      map.set(item.jobId, item.job?.title || `Tin #${item.jobId}`);
    }
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [items]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const fromTime = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;

    return items.filter((item) => {
      const candidateName = getCandidateName(item).toLowerCase();
      const email = item.candidate?.email?.toLowerCase() ?? "";
      const phone = item.candidate?.phone ?? "";
      const jobTitle = item.job?.title?.toLowerCase() ?? "";
      const appliedTime = new Date(item.appliedAt).getTime();

      if (keyword && !candidateName.includes(keyword) && !email.includes(keyword) && !phone.includes(keyword) && !jobTitle.includes(keyword)) {
        return false;
      }

      if (jobId !== "ALL" && item.jobId !== jobId) return false;
      if (status !== "ALL" && item.status !== status) return false;
      if (fromTime && !Number.isNaN(appliedTime) && appliedTime < fromTime) return false;

      return true;
    });
  }, [fromDate, items, jobId, search, status]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = filteredItems.slice((currentPage - 1) * limit, currentPage * limit);
  const firstItem = filteredItems.length === 0 ? 0 : (currentPage - 1) * limit + 1;
  const lastItem = Math.min(currentPage * limit, filteredItems.length);

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(filterStatuses.map((item) => [item.value, 0])) as Record<RecruiterApplicationStatus | "ALL", number>;
    byStatus.ALL = items.length;
    for (const item of items) byStatus[item.status] += 1;
    return byStatus;
  }, [items]);

  const updateStatus = async (
    item: RecruiterApplication,
    nextStatus: Exclude<RecruiterApplicationStatus, "WITHDRAWN">,
  ) => {
    if (item.status === nextStatus) return;
    setUpdatingId(item.id);
    setError(null);

    try {
      const response = await recruiterApplicationsApi.updateStatus(item.id, nextStatus);
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? { ...currentItem, status: response.data.status } : currentItem,
        ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể cập nhật trạng thái ứng viên.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const openResume = async (item: RecruiterApplication) => {
    if (!item.resumeSnapshotUrl) return;
    try {
      const response = await recruiterApplicationsApi.getResumeSnapshotUrl(item.resumeSnapshotUrl);
      window.open(response.data.url, "_blank", "noopener,noreferrer");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể mở CV của ứng viên.",
      );
    }
  };

  const exportCsv = () => {
    const header = ["Ứng viên", "Email", "SĐT", "Tin ứng tuyển", "Ngày ứng tuyển", "Trạng thái"];
    const rows = filteredItems.map((item) => [
      getCandidateName(item),
      item.candidate?.email ?? "",
      item.candidate?.phone ?? "",
      item.job?.title ?? `Tin #${item.jobId}`,
      formatDate(item.appliedAt),
      statusLabels[item.status],
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "danh-sach-ung-vien.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="space-y-2">
          <div className="h-7 w-44 animate-pulse rounded bg-border" />
          <div className="h-4 w-80 animate-pulse rounded bg-border/70" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-lg border border-border bg-surface" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-lg border border-border bg-surface" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header>
        <h1 className="text-xl font-bold text-text">Quản lý ứng viên</h1>
        <p className="mt-1 text-xs text-muted">
          Quản lý và theo dõi tất cả hồ sơ ứng tuyển vào các tin của công ty.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Tổng ứng viên" value={counts.ALL} hint="Tất cả tin tuyển dụng" icon={FileDown} tone="bg-blue-50 text-blue-600" />
        <StatCard label="HR đã xem" value={counts.VIEWED} hint="Đã mở hồ sơ" icon={Eye} tone="bg-emerald-50 text-emerald-600" />
        <StatCard label="Mời phỏng vấn" value={counts.INTERVIEW} hint="Đang chờ lịch" icon={CalendarDays} tone="bg-amber-50 text-amber-600" />
        <StatCard label="Trúng tuyển" value={counts.ACCEPTED} hint="Đạt yêu cầu" icon={UserCheck} tone="bg-violet-50 text-violet-600" />
        <StatCard label="Không đạt" value={counts.REJECTED} hint="Đã từ chối" icon={UserRoundX} tone="bg-rose-50 text-rose-600" />
      </section>

      <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(220px,1fr)_190px_170px_170px_auto]">
            <label className="relative">
              <span className="sr-only">Tìm kiếm ứng viên</span>
              <Search className="absolute left-3 top-2.5 size-4 text-muted" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Tìm kiếm ứng viên, email, SĐT..."
                className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <select
              value={jobId}
              onChange={(event) => {
                setJobId(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-border bg-surface px-3 text-xs text-text outline-none focus:border-primary"
            >
              <option value="ALL">Tất cả tin tuyển dụng</option>
              {jobOptions.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as RecruiterApplicationStatus | "ALL");
                setPage(1);
              }}
              className="h-10 rounded-lg border border-border bg-surface px-3 text-xs text-text outline-none focus:border-primary"
            >
              {filterStatuses.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-border bg-surface px-3 text-xs text-text outline-none focus:border-primary"
              aria-label="Chọn khoảng thời gian"
            />
            <button
              type="button"
              onClick={() => {
                setFromDate("");
                setPage(1);
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-medium text-text hover:bg-background"
            >
              <Filter className="size-3.5" /> Bộ lọc
            </button>
          </div>
          <button type="button" onClick={exportCsv} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-primary px-3 text-xs font-semibold text-primary hover:bg-primary/5">
            <Download className="size-3.5" /> Xuất CSV
          </button>
        </div>
      </section>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-warning/20 bg-warning/10 px-4 py-3 text-xs text-warning">
          <span>{error}</span>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1 font-semibold underline">
            <RefreshCw className="size-3" /> Thử lại
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs text-muted">
            <thead className="border-b border-border bg-background text-text">
              <tr>
                <th className="w-16 px-5 py-4 font-semibold">STT</th>
                <th className="px-5 py-4 font-semibold">Ứng viên</th>
                <th className="px-5 py-4 font-semibold">Liên hệ</th>
                <th className="px-5 py-4 font-semibold">Tin đã nộp</th>
                <th className="px-5 py-4 font-semibold">Ngày ứng tuyển</th>
                <th className="px-5 py-4 font-semibold">Trạng thái đơn</th>
                <th className="px-5 py-4 text-center font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagedItems.map((item, index) => {
                const candidateName = getCandidateName(item);
                const canChange = item.status !== "WITHDRAWN";

                return (
                  <tr key={item.id} className="transition hover:bg-background/70">
                    <td className="px-5 py-4">{firstItem + index}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {getInitials(candidateName)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-text">{candidateName}</p>
                          <p className="mt-1 text-[11px] text-muted">
                            {item.candidate?.experienceCount ? `${item.candidate.experienceCount} kinh nghiệm` : "Chưa cập nhật kinh nghiệm"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 whitespace-nowrap">
                          <Mail className="size-3.5" />
                          {item.candidate?.email ?? "Chưa có email"}
                        </p>
                        <p className="flex items-center gap-1.5 whitespace-nowrap">
                          <Phone className="size-3.5" />
                          {item.candidate?.phone ?? "Chưa có SĐT"}
                        </p>
                      </div>
                    </td>
                    <td className="max-w-56 px-5 py-4">
                      <p className="font-semibold text-text">{item.job?.title ?? `Tin #${item.jobId}`}</p>
                      <p className="mt-1 text-[11px]">Mã tin: #{item.jobId}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="font-medium text-text">{formatDate(item.appliedAt)}</p>
                      <p className="mt-1 text-[11px]">{formatTime(item.appliedAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      {canChange ? (
                        <select
                          value={item.status}
                          disabled={updatingId === item.id}
                          onChange={(event) =>
                            void updateStatus(
                              item,
                              event.target.value as Exclude<RecruiterApplicationStatus, "WITHDRAWN">,
                            )
                          }
                          className={`h-8 rounded-full border px-2 text-[11px] font-semibold outline-none ${statusStyles[item.status]}`}
                        >
                          {writableStatuses.map((nextStatus) => (
                            <option key={nextStatus} value={nextStatus}>{statusLabels[nextStatus]}</option>
                          ))}
                        </select>
                      ) : (
                        statusBadge(item.status)
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button type="button" onClick={() => void openResume(item)} disabled={!item.resumeSnapshotUrl} title="Xem CV" aria-label="Xem CV" className="grid size-8 place-items-center rounded-full border border-border text-muted transition hover:bg-background hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">
                          <Eye className="size-3.5" />
                        </button>
                        <Link href={`${ROUTES.recruiter.candidates}/${item.id}`} title="Xem thông tin ứng viên" aria-label="Xem thông tin ứng viên" className="grid size-8 place-items-center rounded-full border border-border text-muted transition hover:bg-background hover:text-primary">
                          <Users className="size-3.5" />
                        </Link>
                        <button type="button" title="Nhắn tin" aria-label="Nhắn tin" className="grid size-8 place-items-center rounded-full border border-border text-muted transition hover:bg-background hover:text-primary">
                          <MessageSquare className="size-3.5" />
                        </button>
                        <button type="button" title="Tin ứng tuyển" aria-label="Tin ứng tuyển" className="grid size-8 place-items-center rounded-full border border-border text-muted transition hover:bg-background hover:text-primary">
                          <BriefcaseBusiness className="size-3.5" />
                        </button>
                        <button type="button" title="Thao tác khác" aria-label="Thao tác khác" className="grid size-8 place-items-center rounded-full border border-border text-muted transition hover:bg-background hover:text-primary">
                          <MoreHorizontal className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pagedItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Users className="mx-auto mb-3 size-10 text-muted" />
                    <p className="font-semibold text-text">Chưa có ứng viên phù hợp</p>
                    <p className="mt-1 text-xs text-muted">Thử đổi từ khóa hoặc bộ lọc để xem thêm hồ sơ.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted">
            Hiển thị {firstItem} - {lastItem} trong {filteredItems.length} ứng viên
          </span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted">
              Hiển thị
              <select
                value={limit}
                onChange={(event) => {
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
            <nav className="flex gap-1" aria-label="Phân trang ứng viên">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={currentPage <= 1} className="grid size-8 place-items-center rounded border border-border text-muted hover:bg-background disabled:opacity-40" aria-label="Trang trước">
                <ChevronLeft className="size-3.5" />
              </button>
              <span className="grid min-w-8 place-items-center rounded bg-primary px-2 text-xs font-medium text-white">{currentPage}</span>
              <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={currentPage >= totalPages} className="grid size-8 place-items-center rounded border border-border text-muted hover:bg-background disabled:opacity-40" aria-label="Trang sau">
                <ChevronRight className="size-3.5" />
              </button>
            </nav>
          </div>
        </footer>
      </section>

      <aside className="flex items-start gap-3 rounded-lg border border-success/15 bg-success/5 p-4 text-xs text-success">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        <p className="leading-relaxed">
          Trạng thái có thể chuyển theo quy trình tuyển dụng hiện tại. Nếu thao tác bị từ chối,
          hệ thống sẽ hiển thị lý do để bạn chọn bước phù hợp.
        </p>
      </aside>
    </div>
  );
}
