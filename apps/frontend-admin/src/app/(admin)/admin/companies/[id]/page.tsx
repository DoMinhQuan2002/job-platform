"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Globe2,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UnlockKeyhole,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { ADMIN_ROUTES } from "@/constants/routes";
import {
  adminCompaniesApi,
  type AdminCompanyDetail,
  type CompanyStatus,
} from "@/services/admin-companies.service";

const statusLabels: Record<CompanyStatus, string> = {
  PENDING: "Chờ duyệt",
  ACTIVE: "Hoạt động",
  REJECTED: "Bị từ chối",
  BLOCKED: "Đang bị khóa",
};

const statusStyles: Record<CompanyStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  REJECTED: "bg-red-50 text-red-600 ring-red-100",
  BLOCKED: "bg-red-50 text-red-600 ring-red-100",
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const displayValue = (value?: string | null) => value?.trim() || "--";

type CompanyAction = "approve" | "reject" | "lock" | "unlock";

function StatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${statusStyles[status]}`}
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

function InfoRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="grid gap-2 border-b border-slate-100 py-3 last:border-b-0 sm:grid-cols-[150px_1fr]">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd
        className={`text-sm leading-6 text-slate-800 ${
          strong ? "font-semibold" : "font-medium"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white" />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white" />
        <div className="space-y-5">
          <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
          <div className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      </div>
    </div>
  );
}

function CompanyActionDialog({
  action,
  companyName,
  reason,
  error,
  processing,
  onReasonChange,
  onClose,
  onConfirm,
}: {
  action: CompanyAction;
  companyName: string;
  reason: string;
  error: string | null;
  processing: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const needsReason = action === "lock" || action === "reject";
  const isLock = action === "lock";
  const config = {
    approve: {
      title: "Xác nhận duyệt công ty",
      body: `Bạn có chắc chắn muốn duyệt hồ sơ ${companyName}? Công ty sẽ có thể sử dụng hệ thống.`,
      confirm: "Xác nhận duyệt",
      confirmClass: "bg-emerald-600 hover:bg-emerald-700",
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    reject: {
      title: "Từ chối hồ sơ công ty",
      body: "Vui lòng nhập lý do từ chối để nhà tuyển dụng biết cần bổ sung thông tin gì.",
      confirm: "Xác nhận từ chối",
      confirmClass: "bg-red-600 hover:bg-red-700",
      icon: XCircle,
      iconClass: "bg-red-50 text-red-600",
    },
    lock: {
      title: "Khóa tài khoản công ty",
      body: "Bạn có chắc chắn muốn khóa tài khoản công ty này? Công ty sẽ không thể đăng nhập và sử dụng hệ thống.",
      confirm: "Xác nhận khóa",
      confirmClass: "bg-red-600 hover:bg-red-700",
      icon: LockKeyhole,
      iconClass: "bg-red-50 text-red-600",
    },
    unlock: {
      title: "Xác nhận mở khóa tài khoản",
      body: `Bạn có chắc chắn muốn mở khóa tài khoản ${companyName}? Sau khi mở khóa, công ty có thể đăng nhập và sử dụng hệ thống như bình thường.`,
      confirm: "Xác nhận mở khóa",
      confirmClass: "bg-blue-700 hover:bg-blue-800",
      icon: UnlockKeyhole,
      iconClass: "bg-blue-50 text-blue-700",
    },
  }[action];
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
          {needsReason ? (
            <>
              <p className="text-sm leading-6 text-slate-600">{config.body}</p>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-slate-700">
                  {isLock ? "Lý do khóa tài khoản" : "Lý do từ chối"}{" "}
                  <span className="text-red-500">*</span>
                </span>
                <span className="mt-2 block rounded-lg border border-slate-200 bg-slate-50 p-3 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                  <textarea
                    value={reason}
                    onChange={(event) => onReasonChange(event.target.value)}
                    maxLength={500}
                    rows={5}
                    placeholder={
                      isLock
                        ? "Nhập lý do khóa tài khoản (từ 10 đến 500 ký tự)..."
                        : "Nhập lý do từ chối (từ 10 đến 500 ký tự)..."
                    }
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

export default function AdminCompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const companyId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [company, setCompany] = useState<AdminCompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogAction, setDialogAction] = useState<CompanyAction | null>(null);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    if (!companyId) return;

    let ignore = false;
    const controller = new AbortController();

    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await adminCompaniesApi.detail(companyId, {
          signal: controller.signal,
        });

        if (!ignore) setCompany(result);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Không thể tải chi tiết công ty",
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchCompany();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [companyId]);

  const openDialog = (action: CompanyAction) => {
    setReason("");
    setActionError(null);
    setDialogAction(action);
  };

  const closeDialog = () => {
    if (processingAction) return;
    setDialogAction(null);
    setReason("");
    setActionError(null);
  };

  const handleActionConfirm = async () => {
    if (!company || !dialogAction) return;

    const trimmedReason = reason.trim();
    if (
      (dialogAction === "lock" || dialogAction === "reject") &&
      (trimmedReason.length < 10 || trimmedReason.length > 500)
    ) {
      setActionError("Lý do phải từ 10 đến 500 ký tự.");
      return;
    }

    try {
      setProcessingAction(true);
      setActionError(null);

      const result =
        dialogAction === "approve"
          ? await adminCompaniesApi.approve(company.id)
          : dialogAction === "reject"
            ? await adminCompaniesApi.reject(company.id, trimmedReason)
            : dialogAction === "lock"
              ? await adminCompaniesApi.updateStatus(company.id, {
                  status: "BLOCKED",
                  reason: trimmedReason,
                })
              : await adminCompaniesApi.updateStatus(company.id, {
                  status: "ACTIVE",
                });

      setCompany((current) =>
        current
          ? {
              ...current,
              status: result.status,
              rejectReason:
                result.status === "BLOCKED" || result.status === "REJECTED"
                  ? (result.rejectReason ?? trimmedReason)
                  : null,
              updatedAt: result.updatedAt,
            }
          : current,
      );
      setDialogAction(null);
      setReason("");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Không thể thực hiện thao tác",
      );
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-medium text-slate-500"
          >
            <button
              type="button"
              onClick={() => router.push(ADMIN_ROUTES.companies)}
              className="transition-colors hover:text-blue-600"
            >
              Quản lý công ty
            </button>
            <span className="text-slate-300">&gt;</span>
            <span className="text-slate-700">Chi tiết công ty</span>
          </nav>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              title="Quay lại"
              className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition-colors hover:border-blue-200 hover:text-blue-700"
            >
              <ArrowLeft className="size-5" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Chi tiết công ty
            </h1>
          </div>
        </div>

        {company && (
          <div className="flex flex-wrap gap-3">
            <StatusBadge status={company.status} />
            {company.status === "PENDING" && (
              <>
                <button
                  type="button"
                  onClick={() => openDialog("approve")}
                  title="Duyệt công ty"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <CheckCircle2 className="size-4" />
                  Duyệt công ty
                </button>
                <button
                  type="button"
                  onClick={() => openDialog("reject")}
                  title="Từ chối công ty"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  <XCircle className="size-4" />
                  Từ chối
                </button>
              </>
            )}
            {company.status === "ACTIVE" && (
              <button
                type="button"
                onClick={() => openDialog("lock")}
                title="Khóa công ty"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
              >
                <LockKeyhole className="size-4" />
                Khóa công ty
              </button>
            )}
            {company.status === "BLOCKED" && (
              <button
                type="button"
                onClick={() => openDialog("unlock")}
                title="Mở khóa công ty"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <UnlockKeyhole className="size-4" />
                Mở khóa công ty
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <DetailSkeleton />
      ) : error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          <AlertCircle className="size-4" />
          {error}
        </div>
      ) : company ? (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="grid gap-6 md:grid-cols-[1fr_300px] md:items-center">
              <div className="flex items-center gap-5">
                <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-blue-50 text-blue-700">
                  {company.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Building2 className="size-11" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-slate-900">
                    {company.name}
                  </h2>
                  <div className="mt-3 space-y-1.5 text-sm text-slate-500">
                    <p className="flex items-center gap-2">
                      <Globe2 className="size-4" />
                      <span className="truncate">{displayValue(company.website)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="size-4" />
                      <span className="truncate">{company.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="size-4" />
                      <span>{company.phone}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-slate-100 md:border-l md:pl-8">
                <h3 className="text-sm font-bold text-slate-900">HR sở hữu</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="grid grid-cols-[64px_1fr] gap-3">
                    <dt className="text-slate-500">ID:</dt>
                    <dd className="font-semibold text-slate-900">
                      USR-{company.owner.id.padStart(5, "0")}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[64px_1fr] gap-3">
                    <dt className="text-slate-500">Họ tên:</dt>
                    <dd className="font-semibold text-slate-900">
                      {company.owner.fullName}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[64px_1fr] gap-3">
                    <dt className="text-slate-500">Email:</dt>
                    <dd className="font-medium text-slate-800">
                      {company.owner.email}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                <BriefcaseBusiness className="size-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Thông tin công ty
                </h2>
              </div>
              <dl className="px-5 py-2">
                <InfoRow label="Tên công ty" value={company.name} strong />
                <div className="grid gap-2 border-b border-slate-100 py-3 sm:grid-cols-[150px_1fr]">
                  <dt className="text-sm font-medium text-slate-500">Trạng thái</dt>
                  <dd>
                    <StatusBadge status={company.status} />
                  </dd>
                </div>
                <InfoRow label="Slug" value={company.slug} />
                <InfoRow label="Mã số thuế" value={displayValue(company.taxCode)} />
                <InfoRow
                  label="Quy mô công ty"
                  value={displayValue(company.companySize)}
                />
                <InfoRow label="Địa chỉ" value={company.address} />
                <InfoRow
                  label="Mô tả"
                  value={displayValue(company.description)}
                />
                <InfoRow
                  label="Số tin tuyển dụng"
                  value={`${company.totalJobs.toLocaleString("vi-VN")} tin`}
                  strong
                />
                <InfoRow label="Ngày tạo" value={formatDateTime(company.createdAt)} />
                <InfoRow
                  label="Ngày cập nhật"
                  value={formatDateTime(company.updatedAt)}
                />
              </dl>
            </section>

            <aside className="space-y-5">
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                  <MapPin className="size-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Thông tin liên hệ
                  </h2>
                </div>
                <dl className="px-5 py-4 text-sm">
                  <div className="grid grid-cols-[92px_1fr] gap-4 py-2">
                    <dt className="font-medium text-slate-500">Website</dt>
                    <dd className="break-all font-medium text-blue-600">
                      {displayValue(company.website)}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[92px_1fr] gap-4 py-2">
                    <dt className="font-medium text-slate-500">Email</dt>
                    <dd className="break-all font-medium text-blue-600">
                      {company.email}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[92px_1fr] gap-4 py-2">
                    <dt className="font-medium text-slate-500">Số điện thoại</dt>
                    <dd className="font-medium text-slate-800">{company.phone}</dd>
                  </div>
                  <div className="grid grid-cols-[92px_1fr] gap-4 py-2">
                    <dt className="font-medium text-slate-500">Địa chỉ</dt>
                    <dd className="font-medium leading-6 text-slate-800">
                      {company.address}
                    </dd>
                  </div>
                </dl>
              </section>

              {company.status === "BLOCKED" && (
                <section className="overflow-hidden rounded-xl border border-red-100 bg-red-50/70 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-red-100 px-5 py-4">
                    <LockKeyhole className="size-5 text-red-500" />
                    <h2 className="text-base font-bold text-red-600">
                      Thông tin khóa
                    </h2>
                  </div>
                  <dl className="px-5 py-4 text-sm">
                    <div className="grid grid-cols-[92px_1fr] gap-4 py-2">
                      <dt className="font-medium text-slate-500">Lý do khóa</dt>
                      <dd className="font-medium leading-6 text-slate-800">
                        {displayValue(company.rejectReason)}
                      </dd>
                    </div>
                    <div className="grid grid-cols-[92px_1fr] gap-4 py-2">
                      <dt className="font-medium text-slate-500">Ngày khóa</dt>
                      <dd className="font-medium text-slate-800">
                        {formatDateTime(company.updatedAt)}
                      </dd>
                    </div>
                  </dl>
                </section>
              )}

              {company.status === "ACTIVE" && (
                <section className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0" />
                  <p className="font-medium">
                    Công ty đang hoạt động và có thể đăng tin tuyển dụng.
                  </p>
                </section>
              )}

              {(company.status === "PENDING" || company.status === "REJECTED") && (
                <section className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-700">
                  <UserRound className="mt-0.5 size-5 shrink-0" />
                  <p className="font-medium">
                    Hồ sơ công ty chưa ở trạng thái hoạt động.
                  </p>
                </section>
              )}
            </aside>
          </div>

          {dialogAction && (
            <CompanyActionDialog
              action={dialogAction}
              companyName={company.name}
              reason={reason}
              error={actionError}
              processing={processingAction}
              onReasonChange={(value) => {
                setReason(value);
                if (actionError) setActionError(null);
              }}
              onClose={closeDialog}
              onConfirm={handleActionConfirm}
            />
          )}
        </>
      ) : null}
    </div>
  );
}
