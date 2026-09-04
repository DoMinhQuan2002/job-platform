"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

type DashboardHeaderProps = {
  onRefresh: () => void;
  isRefreshing?: boolean;
};

export function DashboardHeader({
  onRefresh,
  isRefreshing = false,
}: DashboardHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tổng quan hoạt động hệ thống
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Tải lại dữ liệu"
          className="grid size-9.5 place-items-center rounded-xl border border-slate-200/90 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw
            className={`size-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
