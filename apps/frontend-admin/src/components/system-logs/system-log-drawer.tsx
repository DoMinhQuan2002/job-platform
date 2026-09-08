"use client";

import React, { useEffect } from "react";
import {
  X,
  Clock,
  User,
  Tag,
  FileText,
  Building2,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { type SystemLogItem } from "@/services/admin-system-logs.service";
import {
  formatLogDateTime,
  formatOperationName,
  formatTargetTypeName,
  getActionBadge,
  getUserDisplayName,
} from "./system-log-helpers";

interface SystemLogDrawerProps {
  isOpen: boolean;
  log: SystemLogItem | null;
  onClose: () => void;
}

function getShortActionType(action: string): { label: string; badgeClass: string } {
  const act = String(action || "").toUpperCase();
  if (act.includes("CREATE") || act.includes("ADD")) {
    return {
      label: "THÊM",
      badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-200/60",
    };
  }
  if (act.includes("APPROVE")) {
    return {
      label: "DUYỆT",
      badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-200/60",
    };
  }
  if (act.includes("UPDATE") || act.includes("EDIT")) {
    return {
      label: "SỬA",
      badgeClass: "bg-blue-50 text-blue-600 border border-blue-200/60",
    };
  }
  if (act.includes("UNLOCK")) {
    return {
      label: "MỞ KHÓA",
      badgeClass: "bg-blue-50 text-blue-600 border border-blue-200/60",
    };
  }
  if (act.includes("DELETE") || act.includes("REMOVE")) {
    return {
      label: "XÓA",
      badgeClass: "bg-rose-50 text-rose-600 border border-rose-200/60",
    };
  }
  if (act.includes("LOCK") || act.includes("REJECT")) {
    return {
      label: "KHÓA",
      badgeClass: "bg-amber-50 text-amber-600 border border-amber-200/60",
    };
  }
  return {
    label: "KHÁC",
    badgeClass: "bg-slate-100 text-slate-600 border border-slate-200/60",
  };
}

export function SystemLogDrawer({
  isOpen,
  log,
  onClose,
}: SystemLogDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !log) return null;

  const actionBadge = getActionBadge(log.action);
  const shortActionType = getShortActionType(log.action);
  const userDisplay = getUserDisplayName(log);
  const operationName = formatOperationName(log.action);
  const targetName = formatTargetTypeName(log.targetType, log.targetLabel);
  const formattedTime = formatLogDateTime(log.createdAt);

  const userName = userDisplay.secondary
    ? `${userDisplay.primary} ${userDisplay.secondary}`
    : userDisplay.primary;

  return (
    <aside
      className="w-full sm:w-88 lg:w-96 bg-white border border-slate-200/80 rounded-2xl shadow-xs shrink-0 flex flex-col justify-between overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-right-4"
      aria-label="Chi tiết nhật ký"
    >
      <div className="flex-1 overflow-y-auto">
        {/* Panel Header */}
        <div className="px-5 py-4 border-b border-slate-100/80 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-base font-bold text-slate-900">Chi tiết nhật ký</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors hover:bg-slate-50 cursor-pointer"
            aria-label="Đóng panel"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Panel Body / Detail Items */}
        <div className="p-5 space-y-5">
          {/* 1. Thời gian */}
          <div className="flex items-start gap-3.5">
            <div className="text-slate-400 mt-0.5 shrink-0">
              <Clock className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Thời gian</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {formattedTime}
              </p>
            </div>
          </div>

          {/* 2. Người thực hiện */}
          <div className="flex items-start gap-3.5">
            <div className="text-slate-400 mt-0.5 shrink-0">
              <User className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Người thực hiện</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {userName}
              </p>
            </div>
          </div>

          {/* 3. Loại hoạt động */}
          <div className="flex items-start gap-3.5">
            <div className="text-slate-400 mt-0.5 shrink-0">
              <Tag className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Loại hoạt động</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${shortActionType.badgeClass}`}
              >
                {shortActionType.label}
              </span>
            </div>
          </div>

          {/* 4. Nội dung */}
          <div className="flex items-start gap-3.5">
            <div className="text-slate-400 mt-0.5 shrink-0">
              <FileText className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Nội dung</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                {log.description || operationName}
              </p>
            </div>
          </div>

          {/* 5. Đối tượng */}
          <div className="flex items-start gap-3.5">
            <div className="text-slate-400 mt-0.5 shrink-0">
              <Building2 className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Đối tượng</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {targetName}
              </p>
            </div>
          </div>

          {/* 6. Thao tác */}
          <div className="flex items-start gap-3.5">
            <div className="text-slate-400 mt-0.5 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Thao tác</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {operationName || actionBadge.label}
              </p>
            </div>
          </div>

          {/* Dynamic details (oldValue/newValue) if present */}
          {(log.oldValue || log.newValue) && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <p className="font-semibold text-slate-700">Chi tiết thay đổi dữ liệu</p>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {log.oldValue && (
                  <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-100 text-rose-800">
                    <span className="block text-[10px] font-bold text-rose-600 uppercase">
                      Giá trị cũ
                    </span>
                    <span className="font-mono break-all">{log.oldValue}</span>
                  </div>
                )}
                {log.newValue && (
                  <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-800">
                    <span className="block text-[10px] font-bold text-emerald-600 uppercase">
                      Giá trị mới
                    </span>
                    <span className="font-mono break-all">{log.newValue}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optional IP Address */}
          {log.ipAddress && (
            <div className="flex items-start gap-3.5">
              <div className="text-slate-400 mt-0.5 shrink-0">
                <Globe className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Địa chỉ IP</p>
                <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                  {log.ipAddress}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel Bottom Action Button */}
      <div className="p-4 border-t border-slate-100/80 flex justify-end bg-slate-50/50">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </aside>
  );
}
