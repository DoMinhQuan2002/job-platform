"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { notificationsApi } from "../api";
import { formatRelativeTime, NOTIFICATION_ICON, notificationIconClass } from "../lib/format";
import type { NotificationItem } from "../types";

type NotificationDropdownProps = {
  baseHref: string;
  unreadCount: number;
};

export function NotificationDropdown({
  baseHref,
  unreadCount,
}: NotificationDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lắng nghe click ngoài và escape để đóng dropdown
  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // Tải danh sách 5 thông báo mới nhất khi mở dropdown
  useEffect(() => {
    if (!open) return;

    let active = true;
    setLoading(true);

    notificationsApi
      .list({ page: 1, limit: 5 })
      .then((res) => {
        if (active && res?.data) {
          setItems(res.data.items);
        }
      })
      .catch(() => {
        // bỏ qua
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      window.dispatchEvent(new Event("jp-notifications-change"));
    } catch {
      // bỏ qua
    } finally {
      setMarkingAll(false);
    }
  };

  // Click vào 1 thông báo
  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) {
      notificationsApi.markRead(item.id).catch(() => {});
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isRead: true } : it)),
      );
      window.dispatchEvent(new Event("jp-notifications-change"));
    }
    setOpen(false);
    router.push(`${baseHref}/${item.id}`);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative cursor-pointer rounded-md p-1.5 text-slate-700 transition hover:bg-slate-100"
        aria-label="Thông báo"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="size-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-1 grid min-w-[15px] h-[15px] px-1 place-items-center rounded-full bg-red-500 text-[9px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 flex w-80 sm:w-96 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100">
          {/* Header popup */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex cursor-pointer items-center gap-1 text-xs text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <CheckCheck className="size-3.5" />
                )}
                <span>Đã đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-3 animate-pulse">
                    <div className="size-9 rounded-lg bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                <Bell className="mx-auto size-8 text-slate-300 stroke-[1.5]" />
                <p className="mt-2 text-xs">Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              items.map((item) => {
                const Icon = NOTIFICATION_ICON[item.type] || Bell;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleItemClick(item);
                      }
                    }}
                    className={`flex cursor-pointer items-start gap-3 p-3.5 transition hover:bg-slate-50 ${
                      !item.isRead ? "bg-blue-50/30" : "bg-white"
                    }`}
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${notificationIconClass(item.type)}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`truncate text-xs ${
                            !item.isRead
                              ? "font-semibold text-slate-900"
                              : "font-normal text-slate-700"
                          }`}
                        >
                          {item.title}
                        </p>
                        {!item.isRead && (
                          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                        {item.content}
                      </p>
                      <span className="mt-1 block text-[10px] text-slate-400">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer popup */}
          <div className="border-t border-slate-100 bg-slate-50/50 p-2 text-center">
            <Link
              href={baseHref}
              onClick={() => setOpen(false)}
              className="block rounded-md py-1.5 text-xs font-medium text-primary transition hover:bg-primary/5"
            >
              Xem tất cả thông báo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
