"use client";

import Link from "next/link";
import { X, Building2, Briefcase, User, Bell, Clock, ExternalLink } from "lucide-react";
import { type AdminNotificationItem } from "@/services/admin-notifications.service";

interface NotificationDetailPanelProps {
  notification: AdminNotificationItem | null;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onDelete?: (id: string) => void;
}

function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";

  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function getCategoryBadge(type: string): { label: string; className: string } {
  if (type.startsWith("COMPANY")) {
    return {
      label: "Công ty",
      className: "text-blue-600 bg-blue-50",
    };
  }
  if (type.startsWith("ACCOUNT")) {
    return {
      label: "Người dùng",
      className: "text-emerald-600 bg-emerald-50",
    };
  }
  if (type.startsWith("JOB") || type.includes("APPLICATION")) {
    return {
      label: "Tuyển dụng",
      className: "text-blue-600 bg-blue-50",
    };
  }
  return {
    label: "Hệ thống",
    className: "text-amber-600 bg-amber-50",
  };
}

function getLargeIcon(type: string) {
  if (type.startsWith("COMPANY")) {
    return (
      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
        <Building2 className="w-5 h-5" />
      </div>
    );
  }
  if (type.startsWith("ACCOUNT")) {
    return (
      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
        <User className="w-5 h-5" />
      </div>
    );
  }
  if (type.startsWith("JOB") || type.includes("APPLICATION")) {
    return (
      <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-500">
        <Briefcase className="w-5 h-5" />
      </div>
    );
  }
  return (
    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
      <Bell className="w-5 h-5" />
    </div>
  );
}

export function NotificationDetailPanel({
  notification,
  onClose,
  onMarkRead,
}: NotificationDetailPanelProps) {
  if (!notification) return null;

  const category = getCategoryBadge(notification.type);

  // Generate key-value detail list based on notification properties
  const detailRows: { label: string; value: React.ReactNode }[] = [];

  if (notification.type.startsWith("COMPANY")) {
    detailRows.push({ label: "Loại thông báo", value: "Hồ sơ công ty" });
    if (notification.targetId) {
      detailRows.push({
        label: "Mã công ty",
        value: (
          <Link
            href={`/admin/companies/${notification.targetId}`}
            className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
          >
            <span>#{notification.targetId}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        ),
      });
    }
  } else if (notification.type.startsWith("JOB") || notification.type.includes("APPLICATION")) {
    detailRows.push({ label: "Loại thông báo", value: "Tin tuyển dụng" });
    if (notification.targetId) {
      detailRows.push({
        label: "Mã tin tuyển dụng",
        value: (
          <Link
            href={`/admin/jobs/${notification.targetId}`}
            className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
          >
            <span>#{notification.targetId}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        ),
      });
    }
  } else if (notification.type.startsWith("ACCOUNT")) {
    detailRows.push({ label: "Loại thông báo", value: "Tài khoản người dùng" });
    if (notification.targetId) {
      detailRows.push({
        label: "Mã tài khoản",
        value: (
          <Link
            href={`/admin/users/${notification.targetId}`}
            className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
          >
            <span>#{notification.targetId}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        ),
      });
    }
  }

  detailRows.push({
    label: "Người nhận",
    value: (
      <Link
        href={`/admin/users/${notification.userId}`}
        className="text-slate-900 hover:text-blue-600 font-medium"
      >
        User #{notification.userId}
      </Link>
    ),
  });

  detailRows.push({
    label: "Trạng thái",
    value: notification.isRead ? "Đã đọc" : "Chưa đọc",
  });

  detailRows.push({
    label: "Ngày gửi",
    value: formatDateTime(notification.createdAt),
  });

  if (notification.readAt) {
    detailRows.push({
      label: "Ngày đọc",
      value: formatDateTime(notification.readAt),
    });
  }

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 lg:p-6 flex flex-col max-h-[calc(100vh-120px)] overflow-hidden"
      data-purpose="notification-detail-drawer"
    >
      {/* Detail Header (Pinned at top) */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 flex-shrink-0">
        <h3 className="text-base font-bold text-slate-900">Chi tiết thông báo</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {/* Notification Overview Card Item */}
        <div className="flex items-start gap-3.5">
          {getLargeIcon(notification.type)}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm lg:text-base font-bold text-slate-900 leading-snug">
              {notification.title}
            </h4>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="inline-flex items-center text-xs text-slate-400 gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDateTime(notification.createdAt)}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-semibold ${category.className} rounded-full`}>
                {category.label}
              </span>
            </div>
          </div>
        </div>

        {/* Nội dung */}
        <div>
          <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1.5">
            Nội dung
          </h5>
          <p className="text-sm text-slate-600 leading-relaxed">
            {notification.content}
          </p>
        </div>

        <div className="border-t border-slate-100"></div>

        {/* Thông tin chi tiết */}
        <div>
          <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
            Thông tin chi tiết
          </h5>
          <dl className="space-y-3 text-sm">
            {detailRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12">
                <dt className="col-span-5 text-slate-500 font-medium">{row.label}</dt>
                <dd className="col-span-7 text-slate-900 font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Detail Footer Action (Pinned at bottom) */}
      <div className="pt-3.5 border-t border-slate-100 flex justify-start flex-shrink-0">
        {!notification.isRead ? (
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
          >
            Đánh dấu đã đọc
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="px-4 py-2 text-sm font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed"
          >
            Đã đọc
          </button>
        )}
      </div>
    </div>
  );
}
