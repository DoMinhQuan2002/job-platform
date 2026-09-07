"use client";

import { Search, ChevronDown, X } from "lucide-react";

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
    <div className="flex items-center gap-3">
      {/* Search Input */}
      <div className="relative w-64">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search className="size-4" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm thông báo..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
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
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as NotificationStatusFilter)}
          className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 cursor-pointer focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="UNREAD">Chưa đọc</option>
          <option value="READ">Đã đọc</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
          <ChevronDown className="size-4" />
        </div>
      </div>
    </div>
  );
}
