"use client";

import React from "react";
import Link from "next/link";
import {
  UserCheck,
  Building2,
  Lock,
  Unlock,
  PenLine,
  LogIn,
  Activity,
  XCircle,
  FileCheck,
} from "lucide-react";
import type { RecentSystemLog } from "@/services/admin-dashboard.service";

type RecentActivitiesProps = {
  logs: RecentSystemLog[];
  loading?: boolean;
};

export function RecentActivities({ logs, loading }: RecentActivitiesProps) {
  const getActionDetails = (log: RecentSystemLog) => {
    const target = log.targetLabel || (log.targetId ? `#${log.targetId}` : "");

    switch (log.action) {
      case "APPROVE_JOB":
        return {
          icon: UserCheck,
          iconBg: "bg-blue-50 text-blue-600",
          text: `Admin duyệt tin "${target || "Tuyển dụng"}"`,
        };
      case "REJECT_JOB":
        return {
          icon: XCircle,
          iconBg: "bg-rose-50 text-rose-600",
          text: `Admin từ chối tin "${target || "Tuyển dụng"}"`,
        };
      case "APPROVE_COMPANY":
        return {
          icon: Building2,
          iconBg: "bg-emerald-50 text-emerald-600",
          text: `Phê duyệt công ty ${target}`,
        };
      case "REJECT_COMPANY":
        return {
          icon: XCircle,
          iconBg: "bg-rose-50 text-rose-600",
          text: `Từ chối đăng ký công ty ${target}`,
        };
      case "LOCK_USER":
        return {
          icon: Lock,
          iconBg: "bg-rose-50 text-rose-600",
          text: `Khóa tài khoản ${target}`,
        };
      case "UNLOCK_USER":
        return {
          icon: Unlock,
          iconBg: "bg-emerald-50 text-emerald-600",
          text: `Mở khóa tài khoản ${target}`,
        };
      case "LOCK_COMPANY":
        return {
          icon: Lock,
          iconBg: "bg-rose-50 text-rose-600",
          text: `Khóa công ty ${target}`,
        };
      case "UNLOCK_COMPANY":
        return {
          icon: Unlock,
          iconBg: "bg-emerald-50 text-emerald-600",
          text: `Mở khóa công ty ${target}`,
        };
      case "CREATE_JOB_CATEGORY":
        return {
          icon: PenLine,
          iconBg: "bg-purple-50 text-purple-600",
          text: `Thêm ngành nghề: ${target}`,
        };
      case "UPDATE_JOB_CATEGORY":
        return {
          icon: PenLine,
          iconBg: "bg-purple-50 text-purple-600",
          text: `Cập nhật ngành nghề ${target}`,
        };
      case "UPDATE_APPLICATION_STATUS":
        return {
          icon: FileCheck,
          iconBg: "bg-blue-50 text-blue-600",
          text: `Cập nhật trạng thái ứng tuyển #${target}`,
        };
      case "LOGIN_FAILED":
        return {
          icon: LogIn,
          iconBg: "bg-slate-100 text-slate-600",
          text: `Đăng nhập thất bại ${target ? `(${target})` : ""}`,
        };
      default:
        return {
          icon: Activity,
          iconBg: "bg-slate-100 text-slate-600",
          text: log.description || `Thực hiện ${log.action} ${target}`,
        };
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      const hh = String(date.getHours()).padStart(2, "0");
      const mm = String(date.getMinutes()).padStart(2, "0");
      return `${d}/${m}/${y} ${hh}:${mm}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Hoạt động hệ thống
          </h3>
          <Link
            href="/admin/system-logs"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {loading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
                <div className="size-9 rounded-full bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3.5 w-3/4 rounded bg-slate-100" />
                </div>
                <div className="h-3 w-24 rounded bg-slate-100 shrink-0" />
              </div>
            ))
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <div className="mx-auto grid size-10 place-items-center rounded-full bg-slate-50 text-slate-400">
                <Activity className="size-5" />
              </div>
              <p className="mt-2 text-xs">Chưa có hoạt động hệ thống nào</p>
            </div>
          ) : (
            logs.map((log) => {
              const { icon: Icon, iconBg, text } = getActionDetails(log);
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 py-3 text-xs transition-colors hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`grid size-9 shrink-0 place-items-center rounded-full ${iconBg}`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <p className="truncate font-medium text-slate-800" title={text}>
                      {text}
                    </p>
                  </div>
                  <span className="shrink-0 text-2xs text-slate-400">
                    {formatTime(log.createdAt)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
