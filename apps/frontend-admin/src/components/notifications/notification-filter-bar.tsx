"use client";

import { Search, X } from "lucide-react";
import { Select } from "@/components/ui/select";

export type NotificationStatusFilter = "ALL" | "UNREAD" | "READ";

interface NotificationFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: NotificationStatusFilter;
  onStatusFilterChange: (status: NotificationStatusFilter) => void;
}

export function NotificationFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: NotificationFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative w-64 md:w-72">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search className="size-4" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm thông báo..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
            aria-label="Xóa tìm kiếm"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Status Filter Dropdown */}
      <div className="w-44">
        <Select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as NotificationStatusFilter)}
          size="md"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="UNREAD">Chưa đọc</option>
          <option value="READ">Đã đọc</option>
        </Select>
      </div>
    </div>
  );
}
