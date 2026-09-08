"use client";

import { Building2, Briefcase, User, Bell } from "lucide-react";
import { type AdminNotificationItem } from "@/services/admin-notifications.service";

interface NotificationListProps {
  items: AdminNotificationItem[];
  selectedId: string | null;
  onSelectNotification: (item: AdminNotificationItem) => void;
  page?: number;
  limit?: number;
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
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600 transition-colors ${
          isSelected ? "bg-blue-100" : "bg-blue-50"
        }`}
      >
        <Building2 className="w-4 h-4" />
      </div>
    );
  }
  if (type.startsWith("ACCOUNT") || type.includes("USER")) {
    return (
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600 transition-colors ${
          isSelected ? "bg-emerald-100" : "bg-emerald-50"
        }`}
      >
        <User className="w-4 h-4" />
      </div>
    );
  }
  if (type.startsWith("JOB") || type.includes("APPLICATION")) {
    return (
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600 transition-colors ${
          isSelected ? "bg-amber-100" : "bg-amber-50"
        }`}
      >
        <Briefcase className="w-4 h-4" />
      </div>
    );
  }
  return (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-500 transition-colors ${
        isSelected ? "bg-amber-100" : "bg-amber-50"
      }`}
    >
      <Bell className="w-4 h-4" />
    </div>
  );
}

export function NotificationList({
  items,
  selectedId,
  onSelectNotification,
  page = 1,
  limit = 10,
}: NotificationListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
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
    <div
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs"
      data-purpose="notification-list"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-white text-[11px] font-bold tracking-wider text-[#334155] uppercase">
              <th className="py-4 px-4 w-14 text-center">STT</th>
              <th className="py-4 px-4">NỘI DUNG</th>
              <th className="py-4 px-4 w-44">THỜI GIAN</th>
              <th className="py-4 px-6 w-36 text-center">TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {items.map((item, index) => {
              const isSelected = selectedId === item.id;
              const stt = (page - 1) * limit + index + 1;

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectNotification(item)}
                  className={`group cursor-pointer transition-colors hover:bg-slate-50/70 ${
                    isSelected ? "bg-blue-50/50" : "bg-white"
                  }`}
                >
                  {/* STT */}
                  <td className="py-4 px-4 text-center font-normal text-slate-400 text-xs">
                    {stt}
                  </td>

                  {/* NỘI DUNG */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3.5">
                      {getNotificationIcon(item.type, isSelected)}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5 font-normal">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* THỜI GIAN */}
                  <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                    {formatRelativeTime(item.createdAt)}
                  </td>

                  {/* TRẠNG THÁI */}
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    {!item.isRead ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-medium text-blue-600">
                        <span>Chưa đọc</span>
                        <span className="size-1.5 rounded-full bg-blue-600" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-full bg-slate-100/90 px-3.5 py-1 text-xs font-medium text-slate-500">
                        Đã đọc
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
