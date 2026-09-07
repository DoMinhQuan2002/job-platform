"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Banknote,
  Briefcase,
  GraduationCap,
  Clock,
  FileText,
  UserCheck,
  Gift,
  Check,
  X,
  Trash2,
  Globe,
  Mail,
  Phone,
  AlertCircle,
  Info,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  adminJobsApi,
  type AdminJobDetail,
  type AdminJobListItem,
} from "@/services/admin-jobs.service";
import {
  ApproveModal,
  RejectModal,
  DeleteModal,
} from "./job-action-modals";

interface AdminJobDetailViewProps {
  jobId: string;
}

type ToastNotification = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

// Format Currency
const formatSalary = (
  isNegotiable: boolean,
  min: number | string | null,
  max: number | string | null
): string => {
  if (isNegotiable) return "Thỏa thuận";
  if (!min && !max) return "Thỏa thuận";
  const formatMillion = (v: number | string) => {
    const num = Number(v);
    if (isNaN(num)) return String(v);
    if (num >= 1000000) {
      const mil = num / 1000000;
      return `${mil % 1 === 0 ? mil : mil.toFixed(1)} triệu`;
    }
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  if (min && max) {
    return `${formatMillion(min)} - ${formatMillion(max)} VND`;
  }
  if (min) return `Từ ${formatMillion(min)} VND`;
  if (max) return `Đến ${formatMillion(max)} VND`;
  return "Thỏa thuận";
};

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr).slice(0, 10);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "—";
  }
};

const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return "—";
  }
};

export function AdminJobDetailView({ jobId }: AdminJobDetailViewProps) {
  const router = useRouter();

  const [job, setJob] = useState<AdminJobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Modals
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback(
    (type: "success" | "error" | "info", message: string) => {
      const id = String(Date.now());
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  // Fetch detail
  useEffect(() => {
    let isIgnored = false;
    const controller = new AbortController();

    adminJobsApi
      .detail(jobId, controller.signal)
      .then((data) => {
        if (!isIgnored) {
          setJob(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!isIgnored && !controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải thông tin chi tiết tin tuyển dụng."
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
  }, [jobId, reloadKey]);

  // Action handlers
  const handleConfirmApprove = async (jobItem: AdminJobListItem) => {
    setIsApproving(true);
    try {
      await adminJobsApi.approve(jobItem.id);
      addToast(
        "success",
        `Đã phê duyệt tin tuyển dụng "${jobItem.title}" thành công.`
      );
      setApproveModalOpen(false);
      setJob((prev) => (prev ? { ...prev, status: "APPROVED" } : null));
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Phê duyệt tin tuyển dụng thất bại."
      );
    } finally {
      setIsApproving(false);
    }
  };

  const handleConfirmReject = async (
    jobItem: AdminJobListItem,
    reason: string
  ) => {
    setIsRejecting(true);
    try {
      await adminJobsApi.reject(jobItem.id, reason);
      addToast(
        "success",
        `Đã từ chối tin tuyển dụng "${jobItem.title}". Lý do đã được gửi đến nhà tuyển dụng.`
      );
      setRejectModalOpen(false);
      setJob((prev) =>
        prev ? { ...prev, status: "REJECTED", rejectReason: reason } : null
      );
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Từ chối tin tuyển dụng thất bại."
      );
    } finally {
      setIsRejecting(false);
    }
  };

  const handleConfirmDelete = async (
    jobItem: AdminJobListItem
  ) => {
    setIsDeleting(true);
    try {
      await adminJobsApi.remove(jobItem.id);
      addToast(
        "success",
        `Đã xóa tin tuyển dụng "${jobItem.title}" khỏi hệ thống.`
      );
      setDeleteModalOpen(false);
      setTimeout(() => {
        router.push("/admin/jobs");
      }, 1000);
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Xóa tin tuyển dụng thất bại."
      );
      setIsDeleting(false);
    }
  };

  // Render Skeleton Loading
  if (isLoading && !job) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded-md w-72" />
        <div className="flex items-center justify-between">
          <div className="h-10 bg-slate-200 rounded-lg w-36" />
          <div className="h-10 bg-slate-200 rounded-lg w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 h-[500px]" />
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-64" />
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-64" />
          </div>
        </div>
      </div>
    );
  }

  // Render Error
  if (error || !job) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col items-center justify-center text-center gap-3 text-rose-700">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <div>
            <h2 className="text-base font-bold text-rose-900">
              Không thể tải thông tin tin tuyển dụng
            </h2>
            <p className="text-xs text-rose-600 mt-1">
              {error || "Tin tuyển dụng không tồn tại hoặc đã bị xóa."}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Link
              href="/admin/jobs"
              className="px-4 py-2 text-xs font-semibold bg-white border border-rose-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Quay lại danh sách
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setReloadKey((k) => k + 1);
              }}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử lại</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const code = job.code || `JD-2405-${String(job.id).padStart(3, "0")}`;
  const salaryText = formatSalary(
    job.isNegotiable,
    job.salaryMin,
    job.salaryMax
  );
  const locationCity = job.address
    ? job.address.includes("Hà Nội")
      ? "Hà Nội"
      : job.address.includes("Hồ Chí Minh") || job.address.includes("TP.HCM")
        ? "TP. Hồ Chí Minh"
        : job.address.includes("Đà Nẵng")
          ? "Đà Nẵng"
          : job.address.split(",").pop()?.trim() || "Toàn quốc"
    : "Hà Nội";

  return (
    <div className="space-y-6">
      {/* Toast Notifications container */}
      {toasts.length > 0 && (
        <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md pointer-events-auto transition-all animate-in slide-in-from-top-2 duration-300 ${
                t.type === "success"
                  ? "bg-emerald-50/95 border-emerald-200 text-emerald-900"
                  : t.type === "error"
                    ? "bg-rose-50/95 border-rose-200 text-rose-900"
                    : "bg-blue-50/95 border-blue-200 text-blue-900"
              }`}
            >
              {t.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              {t.type === "error" && (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              {t.type === "info" && (
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div className="text-sm font-medium leading-relaxed">
                {t.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-500"
      >
        <Link
          href="/admin/jobs"
          className="hover:text-blue-600 transition-colors"
        >
          Quản lý tuyển dụng
        </Link>
        <span className="text-slate-400">›</span>
        <Link
          href="/admin/jobs"
          className="hover:text-blue-600 transition-colors"
        >
          Danh sách tin tuyển dụng
        </Link>
        <span className="text-slate-400">›</span>
        <span className="text-slate-900 font-semibold">Xem chi tiết</span>
      </nav>

      {/* Navigation & Status Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Back Button */}
        <Link
          href="/admin/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Quay lại danh sách</span>
        </Link>

        {/* Status Pill Badge */}
        {job.status === "APPROVED" && (
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-lg flex items-center gap-2 text-xs md:text-sm w-fit">
            <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            <span className="font-bold text-emerald-800">Đã duyệt</span>
            <span className="text-slate-500 font-normal ml-1">
              {formatDateTime(job.updatedAt || job.createdAt)} bởi Admin
            </span>
          </div>
        )}

        {job.status === "REJECTED" && (
          <div className="bg-red-50/70 border border-red-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-xs w-fit">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-sm font-bold text-red-600 leading-tight">
                Đã từ chối
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {formatDateTime(job.updatedAt || job.createdAt)} bởi Admin
              </div>
            </div>
          </div>
        )}

        {job.status === "PENDING" && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 w-fit">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Chờ duyệt
          </span>
        )}

        {job.status === "CLOSED" && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 w-fit">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Hết hạn
          </span>
        )}
      </div>

      {/* Two-Column Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Main Job Details (8 cols) */}
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
            {/* Job Title & Company Header Block */}
            <div className="flex items-start gap-4">
              {/* Company Logo Box */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center shrink-0 border ${
                  job.status === "REJECTED"
                    ? "bg-red-50 text-red-500 border-red-100"
                    : "bg-blue-50 text-blue-600 border-blue-100"
                }`}
              >
                <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              {/* Main Job Info & Meta Tags */}
              <div className="space-y-2 flex-1 min-w-0">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{job.company.name}</span>
                </div>

                {/* Attributes Row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-slate-600 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {locationCity}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-slate-400" />
                    {salaryText}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {job.experience
                      ? `${job.experience} năm`
                      : "Không yêu cầu KN"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    Đại học
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {job.jobType === "FULL_TIME"
                      ? "Toàn thời gian"
                      : "Bán thời gian"}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section: Mô tả công việc */}
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Mô tả công việc</span>
              </h2>
              {job.description.includes("<p>") ||
              job.description.includes("<ul>") ? (
                <div
                  className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 prose-sm max-w-none pl-1"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              ) : (
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside leading-relaxed pl-1">
                  {job.description
                    .split("\n")
                    .filter((l) => l.trim())
                    .map((line, idx) => (
                      <li key={idx}>
                        {line.replace(/^[•\-\*]\s*/, "")}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Section: Yêu cầu ứng viên */}
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Yêu cầu ứng viên</span>
              </h2>
              {job.requirements.includes("<p>") ||
              job.requirements.includes("<ul>") ? (
                <div
                  className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 prose-sm max-w-none pl-1"
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              ) : (
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside leading-relaxed pl-1">
                  {job.requirements
                    .split("\n")
                    .filter((l) => l.trim())
                    .map((line, idx) => (
                      <li key={idx}>
                        {line.replace(/^[•\-\*]\s*/, "")}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Section: Quyền lợi */}
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Gift className="w-4 h-4 text-blue-600" />
                <span>Quyền lợi</span>
              </h2>
              {job.benefits ? (
                job.benefits.includes("<p>") ||
                job.benefits.includes("<ul>") ? (
                  <div
                    className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 prose-sm max-w-none pl-1"
                    dangerouslySetInnerHTML={{ __html: job.benefits }}
                  />
                ) : (
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside leading-relaxed pl-1">
                    {job.benefits
                      .split("\n")
                      .filter((l) => l.trim())
                      .map((line, idx) => (
                        <li key={idx}>
                          {line.replace(/^[•\-\*]\s*/, "")}
                        </li>
                      ))}
                  </ul>
                )
              ) : (
                <p className="text-xs sm:text-sm text-slate-500 italic pl-1">
                  Theo chính sách và quy định của công ty.
                </p>
              )}
            </div>

            {/* Rejection Reason Highlighted Box (State 2: REJECTED) */}
            {job.status === "REJECTED" && (
              <div className="bg-red-50/60 border border-red-200 rounded-xl p-4.5 flex items-start gap-3 mt-6">
                <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-red-600">
                    Lý do từ chối
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {job.rejectReason ||
                      "Thông tin mô tả công việc chưa rõ ràng, yêu cầu chưa cụ thể."}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1 font-normal">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {formatDateTime(job.updatedAt || job.createdAt)} bởi Admin
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Sidebar Metadata Cards (4 cols) */}
        <section className="lg:col-span-4 space-y-6">
          {/* Card 1: Thông tin công ty */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-blue-600 tracking-tight">
              Thông tin công ty
            </h2>
            <div className="space-y-3.5 text-xs text-slate-700">
              {/* Company Name */}
              <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Building2 className="w-4 h-4" />
                </div>
                <span>{job.company.name}</span>
              </div>

              {/* Website */}
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`https://${job.company.name.toLowerCase().replace(/\s+/g, "")}.vn`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-blue-600 hover:underline truncate"
                >
                  https://{job.company.name.toLowerCase().replace(/\s+/g, "")}.vn
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-600">
                  hr@{job.company.name.toLowerCase().replace(/\s+/g, "")}.vn
                </span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-600">0987 654 321</span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 leading-relaxed">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600">
                  {job.address ||
                    "Tầng 5, Tòa nhà ABC, 123 Nguyễn Trãi, Phường Thượng Đình, Quận Thanh Xuân, Hà Nội"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Thông tin tin tuyển dụng */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-blue-600 tracking-tight">
              Thông tin tin tuyển dụng
            </h2>
            <div className="divide-y divide-slate-100 text-xs text-slate-600">
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Mã tin</span>
                <span className="font-semibold text-slate-900">{code}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Ngày đăng</span>
                <span className="font-medium text-slate-900">
                  {formatDateTime(job.createdAt)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Hạn ứng tuyển</span>
                <span className="font-medium text-slate-900">
                  {formatDate(job.deadline)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Ngành nghề</span>
                <span className="font-medium text-slate-900">
                  {job.category?.name || "Công nghệ thông tin"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Cấp bậc</span>
                <span className="font-medium text-slate-900">Nhân viên</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Hình thức làm việc</span>
                <span className="font-medium text-slate-900">
                  {job.jobType === "FULL_TIME"
                    ? "Toàn thời gian"
                    : "Bán thời gian"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Số lượng tuyển</span>
                <span className="font-medium text-slate-900">
                  {String(job.quantity || 2).padStart(2, "0")}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Người đăng</span>
                <span className="font-medium text-slate-900">
                  {job.company?.name}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* BEGIN: Bottom Action Bar */}
      <footer className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8">
        <div className="text-slate-900 font-bold text-sm">Hành động</div>

        <div className="flex flex-wrap items-center gap-3">
          {/* STATE 1: APPROVED */}
          {job.status === "APPROVED" && (
            <>
              {/* Approved Badge */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg px-4 py-2 flex items-center gap-2 cursor-default">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <div className="text-left">
                  <div className="text-xs font-bold text-emerald-700">
                    Tin đã được duyệt
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal">
                    {formatDateTime(job.updatedAt || job.createdAt)} bởi Admin
                  </div>
                </div>
              </div>

              {/* Reject Button */}
              <button
                type="button"
                onClick={() => setRejectModalOpen(true)}
                className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 rounded-lg px-4 py-2 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-rose-500 stroke-[2.5]" />
                <div className="text-left">
                  <div className="text-xs font-bold text-rose-700">Từ chối</div>
                  <div className="text-[11px] text-slate-500 font-normal">
                    Nhập lý do từ chối
                  </div>
                </div>
              </button>

              {/* Delete Post Button */}
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-2 flex items-center gap-2 text-xs font-semibold h-[42px] transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-slate-500" />
                <span>Xóa tin tuyển dụng</span>
              </button>
            </>
          )}

          {/* STATE 2: REJECTED */}
          {job.status === "REJECTED" && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4 stroke-2" />
              <span>Xóa tin tuyển dụng</span>
            </button>
          )}

          {/* STATE 3: PENDING */}
          {job.status === "PENDING" && (
            <>
              {/* Duyệt tin tuyển dụng Button */}
              <button
                type="button"
                onClick={() => setApproveModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Duyệt tin tuyển dụng</span>
              </button>

              {/* Từ chối Button */}
              <button
                type="button"
                onClick={() => setRejectModalOpen(true)}
                className="inline-flex flex-col items-center justify-center px-4 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
              >
                <div className="inline-flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
                  <span>Từ chối</span>
                </div>
                <span className="text-[10px] text-red-400 font-normal leading-tight">
                  Nhập lý do từ chối
                </span>
              </button>

              {/* Xóa tin tuyển dụng Button */}
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-slate-500 stroke-2" />
                <span>Xóa tin tuyển dụng</span>
              </button>
            </>
          )}

          {/* CLOSED STATE */}
          {job.status === "CLOSED" && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4 stroke-2" />
              <span>Xóa tin tuyển dụng</span>
            </button>
          )}
        </div>
      </footer>
      {/* END: Bottom Action Bar */}

      {/* Confirmation Modals */}
      <ApproveModal
        job={job}
        isOpen={approveModalOpen}
        isLoading={isApproving}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
      />

      <RejectModal
        job={job}
        isOpen={rejectModalOpen}
        isLoading={isRejecting}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
      />

      <DeleteModal
        job={job}
        isOpen={deleteModalOpen}
        isLoading={isDeleting}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
