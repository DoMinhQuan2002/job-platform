"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCheck, RefreshCw, AlertCircle, CheckCircle2, Info } from "lucide-react";
import {
  adminNotificationsApi,
  NOTIFICATION_CATEGORY_TYPES,
  type AdminNotificationCategory,
  type AdminNotificationItem,
  type AdminNotificationsResponse,
} from "@/services/admin-notifications.service";
import { NotificationStatusTabs } from "./notification-status-tabs";
import { NotificationFilterBar, type NotificationStatusFilter } from "./notification-filter-bar";
import { NotificationList } from "./notification-list";
import { NotificationDetailPanel } from "./notification-detail-panel";
import { NotificationSkeleton } from "./notification-skeleton";
import { NotificationTablePagination } from "./notification-table-pagination";

type ToastNotification = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

export function AdminNotificationsView() {
  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<AdminNotificationCategory>("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<NotificationStatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Data & Counts
  const [data, setData] = useState<AdminNotificationsResponse | null>(null);
  const [tabCounts, setTabCounts] = useState<Record<AdminNotificationCategory, number>>({
    ALL: 0,
    COMPANY: 0,
    JOB: 0,
    USER: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Selected Notification: null = 1-column view; not null = 2-column view
  const [selectedNotification, setSelectedNotification] = useState<AdminNotificationItem | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((type: "success" | "error" | "info", message: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Fetch counts for all categories
  const fetchCounts = useCallback(async (signal?: AbortSignal) => {
    try {
      const [allRes, compRes, jobRes, userRes] = await Promise.all([
        adminNotificationsApi.list({ limit: 1 }, signal),
        adminNotificationsApi.list({
          limit: 1,
          type: NOTIFICATION_CATEGORY_TYPES.COMPANY ?? undefined,
        }, signal),
        adminNotificationsApi.list({
          limit: 1,
          type: NOTIFICATION_CATEGORY_TYPES.JOB ?? undefined,
        }, signal),
        adminNotificationsApi.list({
          limit: 1,
          type: NOTIFICATION_CATEGORY_TYPES.USER ?? undefined,
        }, signal),
      ]);

      setTabCounts({
        ALL: allRes.pagination.total ?? 0,
        COMPANY: compRes.pagination.total ?? 0,
        JOB: jobRes.pagination.total ?? 0,
        USER: userRes.pagination.total ?? 0,
      });
    } catch {
      // Ignored
    }
  }, []);

  // Fetch notification list
  useEffect(() => {
    let isIgnored = false;
    const controller = new AbortController();

    const types = NOTIFICATION_CATEGORY_TYPES[activeTab] ?? undefined;
    let isRead: boolean | undefined = undefined;
    if (statusFilter === "UNREAD") isRead = false;
    if (statusFilter === "READ") isRead = true;

    adminNotificationsApi
      .list(
        {
          page,
          limit,
          isRead,
          type: types,
        },
        controller.signal
      )
      .then((response) => {
        if (!isIgnored) {
          setData(response);
          setError(null);
          fetchCounts(controller.signal);

          // If a selected item was active, update its reference if it still exists in the list
          setSelectedNotification((prev) => {
            if (!prev) return null;
            const match = response.items.find((it) => it.id === prev.id);
            return match ?? prev;
          });
        }
      })
      .catch((err: unknown) => {
        if (isIgnored || controller.signal.aborted) return;
        const msg = err instanceof Error ? err.message : "Không thể tải danh sách thông báo.";
        if (msg.toLowerCase().includes("abort")) return;
        setError(msg);
      })
      .finally(() => {
        if (!isIgnored) {
          setIsLoading(false);
        }
      });

    return () => {
      isIgnored = true;
      controller.abort();
    };
  }, [activeTab, statusFilter, page, limit, reloadKey, fetchCounts]);

  // Client-side search filtering if search keyword is present
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (!search.trim()) return data.items;

    const term = search.toLowerCase().trim();
    return data.items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.content.toLowerCase().includes(term)
    );
  }, [data, search]);

  // Handle Mark Single Read
  const handleMarkRead = async (id: string) => {
    try {
      await adminNotificationsApi.markRead(id);
      setData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
          ),
        };
      });
      setSelectedNotification((prev) =>
        prev && prev.id === id
          ? { ...prev, isRead: true, readAt: new Date().toISOString() }
          : prev
      );
      addToast("success", "Đã đánh dấu thông báo là đã đọc.");
      void fetchCounts();
    } catch {
      addToast("error", "Không thể cập nhật trạng thái thông báo.");
    }
  };

  // Handle Mark All Read
  const handleMarkAllRead = async () => {
    if (isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      const count = await adminNotificationsApi.markAllRead();
      setData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map((item) => ({
            ...item,
            isRead: true,
            readAt: new Date().toISOString(),
          })),
        };
      });
      setSelectedNotification((prev) =>
        prev ? { ...prev, isRead: true, readAt: new Date().toISOString() } : null
      );
      addToast("success", `Đã đánh dấu ${count || "tất cả"} thông báo là đã đọc.`);
      void fetchCounts();
    } catch {
      addToast("error", "Không thể đánh dấu đã đọc tất cả.");
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Handle Delete Single Notification
  const handleDelete = async (id: string) => {
    try {
      await adminNotificationsApi.remove(id);
      setData((prev) => {
        if (!prev) return null;
        const newItems = prev.items.filter((item) => item.id !== id);
        return {
          ...prev,
          items: newItems,
          pagination: {
            ...prev.pagination,
            total: Math.max(0, prev.pagination.total - 1),
          },
        };
      });

      // Close detail view if deleting currently selected item
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }

      addToast("success", "Đã xóa thông báo thành công.");
      void fetchCounts();
    } catch {
      addToast("error", "Không thể xóa thông báo.");
    }
  };

  // Select a notification to view detail (opens 2-column view, does not auto mark read)
  const handleSelectNotification = (item: AdminNotificationItem) => {
    setSelectedNotification(item);
  };

  const hasSelectedNotification = selectedNotification !== null;

  return (
    <div className="space-y-4">
      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-medium shadow-lg animate-fadeIn border ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : toast.type === "error"
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-blue-50 text-blue-800 border-blue-200"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="size-4 text-emerald-600" />}
            {toast.type === "error" && <AlertCircle className="size-4 text-red-600" />}
            {toast.type === "info" && <Info className="size-4 text-blue-600" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Page Title & Header Actions with Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Thông báo</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Xem và theo dõi tất cả thông báo trong hệ thống.
          </p>
        </div>

        {/* Filters: Search and Status dropdown */}
        <div className="flex items-center gap-3">
          <NotificationFilterBar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          />

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            title="Đánh dấu tất cả đã đọc"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <CheckCheck className={`size-4 text-blue-600 ${isMarkingAll ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Đọc tất cả</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <NotificationStatusTabs
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        counts={tabCounts}
      />

      {/* Error state with retry */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 font-semibold text-red-800 hover:bg-red-200"
          >
            <RefreshCw className="size-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Main Content Layout: 1 column default, 2 columns when an item is clicked */}
      {isLoading ? (
        <NotificationSkeleton count={limit} hasDetail={hasSelectedNotification} />
      ) : (
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Notification List Column: Full width (col-span-12) if no detail, or col-span-7 if detail is open */}
          <div
            className={`flex flex-col space-y-4 transition-all duration-200 ${
              hasSelectedNotification ? "col-span-12 lg:col-span-7" : "col-span-12"
            }`}
          >
            <NotificationList
              items={filteredItems}
              selectedId={selectedNotification?.id ?? null}
              onSelectNotification={handleSelectNotification}
            />

            {/* Pagination */}
            {data && data.pagination.total > 0 && (
              <NotificationTablePagination
                page={page}
                limit={limit}
                total={data.pagination.total}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            )}
          </div>

          {/* Notification Detail Drawer (Right side, col-span-5): only shown when an item is selected */}
          {hasSelectedNotification && (
            <div className="col-span-12 lg:col-span-5 sticky top-4 animate-fadeIn">
              <NotificationDetailPanel
                notification={selectedNotification}
                onClose={() => setSelectedNotification(null)}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
