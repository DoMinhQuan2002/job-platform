"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { notificationIconClass, NOTIFICATION_ICON, formatRelativeTime } from "../lib/format";
import type { NotificationItem } from "../types";

type NotificationListItemProps = {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
  onDelete: (notification: NotificationItem) => void;
};

export function NotificationListItem({
  notification,
  onMarkRead,
  onDelete,
}: NotificationListItemProps) {
  const Icon = NOTIFICATION_ICON[notification.type];

  return (
    <li
      className={`group flex items-start gap-3 rounded-2xl border p-4 transition ${
        notification.isRead
          ? "border-slate-200/90 bg-white hover:border-slate-300"
          : "border-blue-100 bg-blue-50/40 hover:border-blue-200"
      }`}
    >
      {!notification.isRead ? (
        <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
      ) : (
        <span className="mt-2 size-2 shrink-0" aria-hidden="true" />
      )}

      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${notificationIconClass(notification.type)}`}
      >
        <Icon className="size-5" />
      </span>

      <Link
        href={`${ROUTES.notifications.root}/${notification.id}`}
        onClick={() => {
          if (!notification.isRead) onMarkRead(notification.id);
        }}
        className="min-w-0 flex-1"
      >
        <h4 className="truncate text-sm font-bold text-slate-900">{notification.title}</h4>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{notification.content}</p>
      </Link>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="text-[11px] text-slate-400">
          {formatRelativeTime(notification.createdAt)}
        </span>
        <button
          type="button"
          onClick={() => onDelete(notification)}
          aria-label="Xóa thông báo"
          className="rounded-lg p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </li>
  );
}
