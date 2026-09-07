"use client";

import { Building2, Briefcase, User, Bell } from "lucide-react";
import { type AdminNotificationItem } from "@/services/admin-notifications.service";

interface NotificationListProps {
  items: AdminNotificationItem[];
  selectedId: string | null;
  onSelectNotification: (item: AdminNotificationItem) => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
  return date.toLocaleDateString("vi-VN");
}

export function getNotificationIcon(type: string, isSelected = false) {
  if (type.startsWith("COMPANY")) {
    return (
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 transition-colors ${
          isSelected ? "bg-blue-100" : "bg-blue-50"
        }`}
      >
        <Building2 className="w-5 h-5" />
      </div>
    );
  }
  if (type.startsWith("ACCOUNT")) {
    return (
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-600 transition-colors ${
          isSelected ? "bg-emerald-100" : "bg-emerald-50"
        }`}
      >
        <User className="w-5 h-5" />
      </div>
    );
  }
  if (type.startsWith("JOB") || type.includes("APPLICATION")) {
    return (
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-orange-500 transition-colors ${
          isSelected ? "bg-orange-100" : "bg-orange-50"
        }`}
      >
        <Briefcase className="w-5 h-5" />
      </div>
    );
  }
  return (
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-500 transition-colors ${
        isSelected ? "bg-amber-100" : "bg-amber-50"
      }`}
    >
      <Bell className="w-5 h-5" />
    </div>
  );
}

export function NotificationList({
  items,
  selectedId,
  onSelectNotification,
}: NotificationListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <Bell className="mx-auto size-12 text-slate-300" />
        <h3 className="mt-3 text-sm font-bold text-slate-800">
          Không tìm thấy thông báo
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Không có thông báo nào phù hợp với bộ lọc hiện tại.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2" data-purpose="notification-list">
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        return (
          <div
            key={item.id}
            onClick={() => onSelectNotification(item)}
            className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition border ${
              isSelected
                ? "bg-blue-50/70 border-blue-200 shadow-xs"
                : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-xs"
            }`}
          >
            {/* Left Info */}
            <div className="flex items-center gap-3.5 min-w-0">
              {getNotificationIcon(item.type, isSelected)}
              <div className="min-w-0 pr-2">
                <h4
                  className={`text-sm leading-snug truncate ${
                    isSelected || !item.isRead
                      ? "font-semibold text-slate-900"
                      : "font-medium text-slate-800"
                  }`}
                >
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {item.content}
                </p>
              </div>
            </div>

            {/* Right Meta */}
            <div className="flex items-center gap-2 flex-shrink-0 pl-2">
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {formatRelativeTime(item.createdAt)}
              </span>
              {!item.isRead && (
                <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
