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
  getActionCategory,
  getUserDisplayName,
} from "./system-log-helpers";

interface SystemLogDrawerProps {
  isOpen: boolean;
  log: SystemLogItem | null;
  onClose: () => void;
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

  const category = getActionCategory(log.action);
  const userDisplay = getUserDisplayName(log);
  const operationName = formatOperationName(log.action);
  const targetName = formatTargetTypeName(log.targetType, log.targetLabel);
  const formattedTime = formatLogDateTime(log.createdAt);

  return (
    <aside
      className="w-full sm:w-88 lg:w-96 bg-white border border-slate-200 rounded-xl shadow-md shrink-0 flex flex-col justify-between overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-right-4"
      aria-label="Chi tiết nhật ký"
    >
      <div className="flex-1 overflow-y-auto">
        {/* Panel Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-base font-bold text-slate-900">Chi tiết nhật ký</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors hover:bg-slate-50 cursor-pointer"
            title="Đóng panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Body / Detail Items */}
        <div className="p-5 space-y-6">
          {/* Item: Thời gian */}
          <div className="flex items-start gap-3.5">
            <div className="text-slate-400 mt-0.5 shrink-0">
              <Clock className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Thời gian</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 font-mono">
                {formattedTime}
              </p>
            </div>
          </div>

          {/* Item: Người thực hiện */}
          <div className="flex items-start gap-3.5">
            <div className="text-slate-400 mt-0.5 shrink-0">
              <User className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Người thực hiện</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                  {userDisplay.initials}
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {userDisplay.primary}{" "}
                  <span className="text-slate-500 font-normal text-xs">
                    {userDisplay.secondary}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Item: Loại hoạt động */}
          <div className="flex items-start gap-3.5">
            <div className="text-slate-400 mt-0.5 shrink-0">
              <Tag className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Loại hoạt động</p>
              <span
                className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${category.badgeClass}`}
              >
                {category.label}
              </span>
            </div>
          </div>

          {/* Item: Nội dung */}
          <div className="flex items-start gap-3.5">
            <div className="text-slate-400 mt-0.5 shrink-0">
              <FileText className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Nội dung</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 leading-snug">
                {log.description || formatOperationName(log.action)}
              </p>
            </div>
          </div>

          {/* Item: Đối tượng */}
          <div className="flex items-start gap-3.5">
            <div className="text-slate-400 mt-0.5 shrink-0">
              <Building2 className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Đối tượng</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                {targetName}
              </p>
              {log.targetId && (
                <span className="text-[11px] text-slate-400 font-mono">
                  ID: #{log.targetId}
                </span>
              )}
            </div>
          </div>

          {/* Item: Thao tác */}
          <div className="flex items-start gap-3.5">
            <div className="text-slate-400 mt-0.5 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Thao tác</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                {operationName}
              </p>
            </div>
          </div>

          {/* Item: Chi tiết thay đổi (nếu có oldValue/newValue) */}
          {(log.oldValue || log.newValue) && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Chi tiết thay đổi dữ liệu</span>
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {log.oldValue && (
                  <div className="p-2 rounded bg-rose-50/70 border border-rose-100 text-rose-800">
                    <span className="block text-[10px] font-bold text-rose-600 uppercase">
                      Giá trị cũ
                    </span>
                    <span className="font-mono break-all">{log.oldValue}</span>
                  </div>
                )}
                {log.newValue && (
                  <div className="p-2 rounded bg-emerald-50/70 border border-emerald-100 text-emerald-800">
                    <span className="block text-[10px] font-bold text-emerald-600 uppercase">
                      Giá trị mới
                    </span>
                    <span className="font-mono break-all">{log.newValue}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Item: Địa chỉ IP */}
          {log.ipAddress && (
            <div className="flex items-start gap-3.5">
              <div className="text-slate-400 mt-0.5 shrink-0">
                <Globe className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Địa chỉ IP</p>
                <p className="text-sm font-mono font-medium text-slate-700 mt-0.5">
                  {log.ipAddress}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel Bottom Action Button */}
      <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
        <button
          type="button"
          onClick={onClose}
          className="px-7 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors shadow-xs cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </aside>
  );
}
