"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  Home,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AppAlertDialog } from "@/components/ui/app-alert-dialog";
import { Select } from "@/components/ui/select";
import { ApiError } from "@/lib/api-error";
import { ROUTES } from "@/constants/routes";
import { CandidateWorkspaceLayout } from "@/modules/candidate/components";
import { notificationsApi } from "../api";
import { NotificationListItem } from "../components/notification-list-item";
import { CANDIDATE_NOTIFICATION_TABS } from "../lib/format";
import type { NotificationItem, NotificationType } from "../types";

type ReadFilter = "ALL" | "UNREAD" | "READ";
type TimeFilter = "ALL" | "TODAY" | "7D" | "30D";

const READ_FILTERS: Array<{ value: ReadFilter; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "UNREAD", label: "Chưa đọc" },
  { value: "READ", label: "Đã đọc" },
];

const TIME_FILTERS: Array<{ value: TimeFilter; label: string }> = [
  { value: "ALL", label: "Tất cả thời gian" },
  { value: "TODAY", label: "Hôm nay" },
  { value: "7D", label: "7 ngày qua" },
  { value: "30D", label: "30 ngày qua" },
];

function resolveTimeRange(filter: TimeFilter): { from?: string; to?: string } {
  if (filter === "ALL") return {};
  const now = new Date();
  const to = now.toISOString();
  const from = new Date(now);
  if (filter === "TODAY") from.setHours(0, 0, 0, 0);
  if (filter === "7D") from.setDate(from.getDate() - 7);
  if (filter === "30D") from.setDate(from.getDate() - 30);
  return { from: from.toISOString(), to };
}

const PAGE_SIZE = 10;

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [readFilter, setReadFilter] = useState<ReadFilter>("ALL");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("ALL");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NotificationItem | null>(null);

  const activeTypes = useMemo<NotificationType[] | undefined>(
    () => CANDIDATE_NOTIFICATION_TABS.find((tab) => tab.value === activeTab)?.types,
    [activeTab],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    try {
      const { from, to } = resolveTimeRange(timeFilter);
      const res = await notificationsApi.list({
        page,
        limit: PAGE_SIZE,
        isRead: readFilter === "ALL" ? undefined : readFilter === "READ",
        type: activeTypes,
        from,
        to,
      });
      setItems(res.data.items);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      setItems([]);
      if (err instanceof ApiError && err.statusCode === 401) {
        setUnauthorized(true);
        setError("Bạn cần đăng nhập để xem thông báo.");
      } else {
        setError(err instanceof Error ? err.message : "Không tải được thông báo.");
      }
    } finally {
      setLoading(false);
    }
  }, [activeTypes, page, readFilter, timeFilter]);

  const loadTabCounts = useCallback(async () => {
    try {
      const results = await Promise.all(
        CANDIDATE_NOTIFICATION_TABS.map((tab) =>
          notificationsApi.list({ page: 1, limit: 1, type: tab.types }),
        ),
      );
      const counts: Record<string, number> = {};
      CANDIDATE_NOTIFICATION_TABS.forEach((tab, index) => {
        counts[tab.value] = results[index].data.pagination.total;
      });
      setTabCounts(counts);
    } catch {
      // Không chặn UI nếu đếm tab lỗi — chỉ ẩn số trong ngoặc.
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTabCounts();
  }, [loadTabCounts]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [activeTab, readFilter, timeFilter]);

  const handleMarkRead = async (id: string) => {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await notificationsApi.markRead(id);
      window.dispatchEvent(new Event("jp-notifications-change"));
    } catch {
      void load();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationsApi.markAllRead();
      toast.success(`Đã đánh dấu ${res.data.updatedCount} thông báo là đã đọc`);
      window.dispatchEvent(new Event("jp-notifications-change"));
      void load();
      void loadTabCounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể đánh dấu đã đọc");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setItems((list) => list.filter((n) => n.id !== id));
    setTotal((t) => Math.max(0, t - 1));
    try {
      await notificationsApi.remove(id);
      window.dispatchEvent(new Event("jp-notifications-change"));
      void loadTabCounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể xóa thông báo");
      void load();
    }
  };

  return (
    <CandidateWorkspaceLayout>
      <header className="space-y-2">
        <nav className="flex items-center gap-1.5 text-[13px] text-muted">
          <Link href={ROUTES.home} className="flex items-center gap-1 hover:text-primary">
            <Home className="size-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="size-3 text-muted" />
          <span className="font-semibold text-foreground">Thông báo</span>
        </nav>
        <h1 className="text-2xl font-bold text-foreground">Thông báo</h1>
        <p className="max-w-xl text-[15px] text-muted">
          Theo dõi các thông báo mới nhất từ hệ thống.
        </p>
      </header>

      <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-4 text-xs sm:gap-6 sm:text-sm">
            {CANDIDATE_NOTIFICATION_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`-mb-3 border-b-2 pb-3 font-bold transition ${
                  activeTab === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
                {tabCounts[tab.value] != null ? ` (${tabCounts[tab.value]})` : ""}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            className="text-xs font-semibold text-primary hover:underline sm:text-sm"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value as ReadFilter)}
            className="w-auto min-w-32 text-xs font-semibold"
            aria-label="Lọc theo trạng thái đọc"
          >
            {READ_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
          <Select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="w-auto min-w-40 text-xs font-semibold"
            aria-label="Lọc theo thời gian"
          >
            {TIME_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải thông báo...
          </div>
        ) : error ? (
          <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
            {unauthorized ? (
              <Link
                href={`${ROUTES.auth.login}?redirect=${encodeURIComponent(ROUTES.notifications.root)}`}
                className="inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                Đăng nhập
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => void load()}
                className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                Thử lại
              </button>
            )}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary">
              <Bell className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Không có thông báo nào</h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 sm:text-sm">
              Thông báo mới sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => void handleMarkRead(id)}
                onDelete={(n) => setDeleteTarget(n)}
              />
            ))}
          </ul>
        )}

        {total > 0 && !loading && !error && totalPages > 1 ? (
          <div className="flex items-center justify-center gap-1.5 pt-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setPage(pageNum)}
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
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              aria-label="Trang sau"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      <AppAlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Xóa thông báo"
        description={`Bạn có chắc muốn xóa thông báo "${deleteTarget?.title ?? ""}"? Hành động này không thể hoàn tác.`}
        tone="error"
        confirmLabel="Xóa"
        onConfirm={handleDelete}
      />
    </CandidateWorkspaceLayout>
  );
}
