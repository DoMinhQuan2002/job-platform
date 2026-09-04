"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, X, AlertCircle } from "lucide-react";

export type DatePreset = "today" | "7days" | "30days" | "thisMonth" | "custom";

export type DashboardDateFilterState = {
  preset: DatePreset;
  fromDate: string;
  toDate: string;
  displayLabel: string;
};

type DateRangePopoverProps = {
  filter: DashboardDateFilterState;
  onApplyFilter: (newFilter: DashboardDateFilterState) => void;
};

const formatDateToVN = (date: Date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatDateShortVN = (date: Date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

export function DateRangePopover({
  filter,
  onApplyFilter,
}: DateRangePopoverProps) {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Form states bên trong Popover
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>(filter.preset);
  const [tempFromDate, setTempFromDate] = useState(filter.fromDate);
  const [tempToDate, setTempToDate] = useState(filter.toDate);

  // Đồng bộ khi prop filter thay đổi
  useEffect(() => {
    setSelectedPreset(filter.preset);
    setTempFromDate(filter.fromDate);
    setTempToDate(filter.toDate);
  }, [filter]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDateOpen(false);
      }
    };
    if (isDateOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDateOpen]);

  // Kiểm tra tính hợp lệ
  const isDateRangeInvalid = Boolean(
    tempFromDate && tempToDate && tempFromDate > tempToDate
  );

  const handleQuickPreset = (preset: "today" | "7days" | "30days", days: number) => {
    setSelectedPreset(preset);
    const end = new Date();
    const start = new Date();
    if (days > 0) {
      start.setDate(end.getDate() - days);
    }
    setTempFromDate(start.toISOString().split("T")[0]);
    setTempToDate(end.toISOString().split("T")[0]);
  };

  const handleThisMonthPreset = () => {
    setSelectedPreset("thisMonth");
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setTempFromDate(firstDay.toISOString().split("T")[0]);
    setTempToDate(now.toISOString().split("T")[0]);
  };

  const handleClearDates = () => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    setTempFromDate(todayStr);
    setTempToDate(todayStr);
    setSelectedPreset("today");
  };

  const handleApply = () => {
    if (isDateRangeInvalid) return;

    let displayLabel = "";
    const now = new Date();

    if (selectedPreset === "today" || tempFromDate === tempToDate) {
      displayLabel = `Hôm nay: ${formatDateToVN(new Date(tempToDate || now))}`;
    } else if (selectedPreset === "7days") {
      const fromD = new Date(tempFromDate);
      const toD = new Date(tempToDate);
      displayLabel = `7 ngày qua (${formatDateShortVN(fromD)} - ${formatDateShortVN(toD)})`;
    } else if (selectedPreset === "30days") {
      displayLabel = `30 ngày qua`;
    } else if (selectedPreset === "thisMonth") {
      displayLabel = `Tháng này`;
    } else if (tempFromDate && tempToDate) {
      const fromD = new Date(tempFromDate);
      const toD = new Date(tempToDate);
      displayLabel = `${formatDateToVN(fromD)} - ${formatDateToVN(toD)}`;
    } else {
      displayLabel = `Hôm nay: ${formatDateToVN(now)}`;
    }

    onApplyFilter({
      preset: selectedPreset,
      fromDate: tempFromDate,
      toDate: tempToDate,
      displayLabel,
    });

    setIsDateOpen(false);
  };

  const handleResetToDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    onApplyFilter({
      preset: "today",
      fromDate: todayStr,
      toDate: todayStr,
      displayLabel: `Hôm nay: ${formatDateToVN(now)}`,
    });
  };

  const isFiltered = filter.preset !== "today";

  return (
    <div className="relative" ref={datePickerRef}>
      {/* Nút trigger kích hoạt Popover */}
      <button
        type="button"
        onClick={() => setIsDateOpen(!isDateOpen)}
        className={`inline-flex items-center gap-2 rounded-xl border py-1.5 px-3 text-xs font-medium shadow-2xs transition-colors cursor-pointer ${
          isFiltered
            ? "border-[#00288E] bg-[#EEF2FF] text-[#00288E]"
            : "border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        <Calendar className="size-3.5 shrink-0 text-current" />
        <span className="font-semibold">{filter.displayLabel}</span>

        {isFiltered ? (
          <span
            role="button"
            tabIndex={0}
            onClick={handleResetToDefault}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleResetToDefault(e as unknown as React.MouseEvent);
              }
            }}
            className="ml-1 rounded-full p-0.5 hover:bg-blue-200 cursor-pointer"
            title="Về ngày hôm nay"
          >
            <X className="size-3" />
          </span>
        ) : (
          <ChevronDown className="size-3.5 text-slate-400" />
        )}
      </button>

      {/* Popover chuẩn theo giao diện Chọn khoảng ngày đăng ký */}
      {isDateOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-2xl border border-[#E0E3E5] bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold text-[#191C1E]">
              Chọn khoảng ngày
            </span>
            <button
              type="button"
              onClick={() => setIsDateOpen(false)}
              className="rounded p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="my-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickPreset("today", 0)}
              className={`rounded-md px-2.5 py-1 text-[11px] transition-colors cursor-pointer ${
                selectedPreset === "today"
                  ? "bg-[#00288E] text-white font-semibold shadow-xs"
                  : "bg-slate-100 font-medium text-[#444653] hover:bg-[#EEF2FF] hover:text-[#00288E]"
              }`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset("7days", 6)}
              className={`rounded-md px-2.5 py-1 text-[11px] transition-colors cursor-pointer ${
                selectedPreset === "7days"
                  ? "bg-[#00288E] text-white font-semibold shadow-xs"
                  : "bg-slate-100 font-medium text-[#444653] hover:bg-[#EEF2FF] hover:text-[#00288E]"
              }`}
            >
              7 ngày qua
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset("30days", 29)}
              className={`rounded-md px-2.5 py-1 text-[11px] transition-colors cursor-pointer ${
                selectedPreset === "30days"
                  ? "bg-[#00288E] text-white font-semibold shadow-xs"
                  : "bg-slate-100 font-medium text-[#444653] hover:bg-[#EEF2FF] hover:text-[#00288E]"
              }`}
            >
              30 ngày qua
            </button>
            <button
              type="button"
              onClick={handleThisMonthPreset}
              className={`rounded-md px-2.5 py-1 text-[11px] transition-colors cursor-pointer ${
                selectedPreset === "thisMonth"
                  ? "bg-[#00288E] text-white font-semibold shadow-xs"
                  : "bg-slate-100 font-medium text-[#444653] hover:bg-[#EEF2FF] hover:text-[#00288E]"
              }`}
            >
              Tháng này
            </button>
          </div>

          {/* Custom Range Inputs */}
          <div className="space-y-2.5 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-[#444653] mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={tempFromDate}
                max={tempToDate || undefined}
                onChange={(e) => {
                  setTempFromDate(e.target.value);
                  setSelectedPreset("custom");
                }}
                className={`w-full rounded-lg border bg-[#F7F9FB] px-2.5 py-1.5 text-xs text-[#191C1E] outline-none transition-colors cursor-pointer ${
                  isDateRangeInvalid
                    ? "border-red-400 focus:border-red-600 bg-red-50/20"
                    : "border-[#C4C5D5] focus:border-[#00288E] focus:bg-white"
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#444653] mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={tempToDate}
                min={tempFromDate || undefined}
                onChange={(e) => {
                  setTempToDate(e.target.value);
                  setSelectedPreset("custom");
                }}
                className={`w-full rounded-lg border bg-[#F7F9FB] px-2.5 py-1.5 text-xs text-[#191C1E] outline-none transition-colors cursor-pointer ${
                  isDateRangeInvalid
                    ? "border-red-400 focus:border-red-600 bg-red-50/20"
                    : "border-[#C4C5D5] focus:border-[#00288E] focus:bg-white"
                }`}
              />
            </div>

            {/* Inline Validation Alert */}
            {isDateRangeInvalid && (
              <div className="rounded-md bg-red-50 p-2 text-[11px] font-medium text-red-600 border border-red-200 flex items-center gap-1.5">
                <AlertCircle className="size-3.5 shrink-0 text-red-600" />
                <span>Từ ngày phải nhỏ hơn hoặc bằng Đến ngày</span>
              </div>
            )}
          </div>

          {/* Popover Actions */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={handleClearDates}
              className="text-[11px] font-medium text-[#444653] hover:text-[#00288E] cursor-pointer"
            >
              Xóa ngày
            </button>
            <button
              type="button"
              disabled={isDateRangeInvalid}
              onClick={handleApply}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-colors ${
                isDateRangeInvalid
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-[#00288E] hover:bg-[#002175] cursor-pointer"
              }`}
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
