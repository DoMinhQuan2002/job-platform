"use client";

import { cn } from "@/lib/utils";
import type { AdminJobStatus } from "@/services/admin-jobs.service";

export type JobStatusTabValue = "ALL" | AdminJobStatus;

interface JobStatusTabsProps {
  activeTab: JobStatusTabValue;
  onTabChange: (tab: JobStatusTabValue) => void;
  counts: {
    ALL: number;
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    CLOSED: number;
  };
}

export function JobStatusTabs({
  activeTab,
  onTabChange,
  counts,
}: JobStatusTabsProps) {
  const tabs: Array<{ id: JobStatusTabValue; label: string; count: number }> = [
    { id: "ALL", label: "Tất cả", count: counts.ALL },
    { id: "PENDING", label: "Chờ duyệt", count: counts.PENDING },
    { id: "APPROVED", label: "Đã duyệt", count: counts.APPROVED },
    { id: "REJECTED", label: "Từ chối", count: counts.REJECTED },
    { id: "CLOSED", label: "Hết hạn", count: counts.CLOSED },
  ];

  return (
    <div className="border-b border-slate-200">
      <ul className="flex items-center gap-8 -mb-px text-sm font-medium overflow-x-auto select-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <li
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "pb-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap",
                isActive
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              {tab.label} ({tab.count})
            </li>
          );
        })}
      </ul>
    </div>
  );
}
