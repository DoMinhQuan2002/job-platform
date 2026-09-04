"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  ChevronRight,
  ClipboardList,
  Eye,
  Home,
  Loader2,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppAlertDialog } from "@/components/ui/app-alert-dialog";
import { ApiError } from "@/lib/api-error";
import { ROUTES } from "@/constants/routes";
import { CandidateWorkspaceLayout } from "@/modules/candidate/components";
import { CompanyLogo } from "@/modules/applications/components/company-logo";
import { notificationsApi } from "../api";
import { NOTIFICATION_ICON, NOTIFICATION_LABEL, formatDateTime, notificationIconClass } from "../lib/format";
import { STATUS_LABEL } from "@/modules/applications/lib/status";
import type { NotificationDetail } from "../types";
import type { ApplicationStatus } from "@/modules/applications/types";

export function NotificationDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const router = useRouter();
  const [notification, setNotification] = useState<NotificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    try {
      const res = await notificationsApi.getDetail(id);
      setNotification(res.data);
      if (!res.data.isRead) {
        void notificationsApi.markRead(id).then(() => {
          window.dispatchEvent(new Event("jp-notifications-change"));
        });
      }
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setUnauthorized(true);
        setError("Bạn cần đăng nhập để xem thông báo.");
      } else if (err instanceof ApiError && err.statusCode === 404) {
        setError("Không tìm thấy thông báo này.");
      } else {
        setError(err instanceof Error ? err.message : "Không tải được thông báo.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    try {
      await notificationsApi.remove(id);
      window.dispatchEvent(new Event("jp-notifications-change"));
      toast.success("Đã xóa thông báo");
      router.push(ROUTES.notifications.root);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể xóa thông báo");
    }
  };

  if (loading) {
    return (
      <CandidateWorkspaceLayout>
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-slate-200/80 bg-white py-24 text-sm text-slate-500 shadow-xs">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải thông báo...
        </div>
      </CandidateWorkspaceLayout>
    );
  }

  if (error || !notification) {
    return (
      <CandidateWorkspaceLayout>
        <div className="space-y-3 rounded-3xl border border-rose-100 bg-rose-50 p-8 text-sm text-rose-800 shadow-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error ?? "Không tìm thấy thông báo."}</p>
          </div>
          {unauthorized ? (
            <Link
              href={`${ROUTES.auth.login}?redirect=${encodeURIComponent(`${ROUTES.notifications.root}/${id}`)}`}
              className="inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
            >
              Đăng nhập
            </Link>
          ) : (
            <Link
              href={ROUTES.notifications.root}
              className="inline-flex rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
            >
              Quay lại danh sách thông báo
            </Link>
          )}
        </div>
      </CandidateWorkspaceLayout>
    );
  }

  const Icon = NOTIFICATION_ICON[notification.type];
  const { job } = notification;

  return (
    <CandidateWorkspaceLayout>
      <header className="space-y-2">
        <nav className="flex items-center gap-1.5 text-[13px] text-muted">
          <Link href={ROUTES.home} className="flex items-center gap-1 hover:text-primary">
            <Home className="size-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="size-3 text-muted" />
          <Link href={ROUTES.notifications.root} className="hover:text-primary">
            Thông báo
          </Link>
          <ChevronRight className="size-3 text-muted" />
          <span className="font-semibold text-foreground">Chi tiết thông báo</span>
        </nav>
        <Link
          href={ROUTES.notifications.root}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Quay lại danh sách thông báo
        </Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="flex items-start gap-3">
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${notificationIconClass(notification.type)}`}
              >
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  {NOTIFICATION_LABEL[notification.type]}
                </p>
                <h1 className="mt-0.5 text-xl font-bold text-slate-900">{notification.title}</h1>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                notification.isRead
                  ? "bg-slate-100 text-slate-500"
                  : "bg-blue-50 text-primary"
              }`}
            >
              {notification.isRead ? "Đã đọc" : "Chưa đọc"}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-slate-700">{notification.content}</p>

          {job ? (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
              <h3 className="text-sm font-bold text-slate-900">Thông tin công việc</h3>
              <div className="flex items-start gap-3">
                <CompanyLogo
                  name={job.company.name}
                  src={job.company.logo ?? undefined}
                  className="size-11 rounded-xl border border-slate-100 bg-white p-1 shadow-2xs"
                />
                <div className="min-w-0">
                  <Link
                    href={`${ROUTES.jobs}/${job.id}`}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    {job.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-500">{job.company.name}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    {job.isNegotiable || (!job.salaryMin && !job.salaryMax)
                      ? "Thỏa thuận"
                      : `${Number(job.salaryMin ?? 0).toLocaleString("vi-VN")} - ${Number(
                          job.salaryMax ?? 0,
                        ).toLocaleString("vi-VN")} VNĐ`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {job.address} · {job.jobType} · {job.jobMode}
                  </p>
                </div>
              </div>
              <Link
                href={`${ROUTES.jobs}/${job.id}`}
                className="inline-flex rounded-xl border border-primary px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5"
              >
                Xem chi tiết công việc
              </Link>
            </div>
          ) : null}

          <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-xs text-blue-900">
            Đây là thông báo tự động từ hệ thống, không cần phản hồi lại thông báo này.
          </div>
        </div>

        <aside className="space-y-5">
          <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <h3 className="mb-1 text-sm font-bold text-slate-900">Hành động</h3>
            {job ? (
              <>
                <Link
                  href={`${ROUTES.jobs}/${job.id}`}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Briefcase className="size-3.5" />
                  Xem chi tiết công việc
                </Link>
                <Link
                  href={`${ROUTES.applications.root}/${job.applicationId}`}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Send className="size-3.5" />
                  Xem đơn ứng tuyển
                </Link>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex w-full items-center gap-2 rounded-xl border border-rose-100 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="size-3.5" />
              Xóa thông báo
            </button>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Thông tin thông báo</h3>
            <dl className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Loại thông báo</dt>
                <dd className="flex items-center gap-1 font-semibold text-slate-700">
                  <ClipboardList className="size-3.5" />
                  {NOTIFICATION_LABEL[notification.type]}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Gửi lúc</dt>
                <dd className="font-semibold text-slate-700">
                  {formatDateTime(notification.createdAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Trạng thái</dt>
                <dd className="font-semibold text-slate-700">
                  {notification.isRead ? "Đã đọc" : "Chưa đọc"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Kênh gửi</dt>
                <dd className="font-semibold text-slate-700">Hệ thống</dd>
              </div>
            </dl>
          </div>

          {job ? (
            <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">Thông tin liên quan</h3>
              <dl className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1 text-slate-500">
                    <Eye className="size-3.5" />
                    Trạng thái đơn hiện tại
                  </dt>
                  <dd className="rounded-full bg-violet-50 px-2 py-0.5 font-semibold text-violet-700">
                    {STATUS_LABEL[job.applicationStatus as ApplicationStatus] ??
                      job.applicationStatus}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1 text-slate-500">
                    <Calendar className="size-3.5" />
                    Cập nhật lần cuối
                  </dt>
                  <dd className="font-semibold text-slate-700">
                    {formatDateTime(notification.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </aside>
      </div>

      <AppAlertDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xóa thông báo"
        description="Bạn có chắc muốn xóa thông báo này? Hành động này không thể hoàn tác."
        tone="error"
        confirmLabel="Xóa"
        onConfirm={handleDelete}
      />
    </CandidateWorkspaceLayout>
  );
}
