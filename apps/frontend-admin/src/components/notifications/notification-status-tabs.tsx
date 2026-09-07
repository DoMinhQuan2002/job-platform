"use client";

import { type AdminNotificationCategory } from "@/services/admin-notifications.service";

interface NotificationStatusTabsProps {
  activeTab: AdminNotificationCategory;
  onChange: (tab: AdminNotificationCategory) => void;
  counts: Record<AdminNotificationCategory, number>;
}

const TABS: { key: AdminNotificationCategory; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "COMPANY", label: "Công ty" },
  { key: "JOB", label: "Tuyển dụng" },
  { key: "USER", label: "Người dùng" },
];

export function NotificationStatusTabs({
  activeTab,
  onChange,
  counts,
}: NotificationStatusTabsProps) {
  return (
    <div
      className="border-b border-slate-200/80 mb-6 flex space-x-8 text-sm font-medium overflow-x-auto"
      data-purpose="status-tabs"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = counts[tab.key] ?? 0;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`pb-3 whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? "text-blue-600 border-blue-600 font-semibold"
                : "text-slate-500 border-transparent hover:text-slate-700"
            }`}
          >
            <span>{tab.label}</span>
            <span>({count})</span>
          </button>
        );
      })}
    </div>
  );
}
