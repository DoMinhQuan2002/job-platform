"use client";

import {
  Briefcase,
  Calendar,
  Check,
  RotateCcw,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import type { RecruiterApplicationStatus } from "@/services/recruiter-applications.service";

export type CandidateSortKey = "applied_desc" | "applied_asc" | "name_asc" | "name_desc";

export type ExperienceFilterKey = "ALL" | "NO_EXP" | "UNDER_1Y" | "1_2Y" | "3_5Y" | "ABOVE_5Y";

export interface RecruiterCandidatesFilterValues {
  status: RecruiterApplicationStatus | "ALL";
  fromDate: string;
  toDate: string;
  experience: ExperienceFilterKey;
  sort: CandidateSortKey;
}

interface RecruiterCandidatesFilterPanelProps {
  initialValues: RecruiterCandidatesFilterValues;
  onApply: (values: RecruiterCandidatesFilterValues) => void;
  onReset: () => void;
}

export const STATUS_FILTER_OPTIONS: Array<{ value: RecruiterApplicationStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "APPLIED", label: "Đã nộp" },
  { value: "VIEWED", label: "HR đã xem" },
  { value: "INTERVIEW", label: "Mời phỏng vấn" },
  { value: "ACCEPTED", label: "Trúng tuyển" },
  { value: "REJECTED", label: "Không đạt" },
  { value: "WITHDRAWN", label: "Đã rút" },
];

export const EXPERIENCE_FILTER_OPTIONS: Array<{ value: ExperienceFilterKey; label: string }> = [
  { value: "ALL", label: "Tất cả kinh nghiệm" },
  { value: "NO_EXP", label: "Chưa cập nhật / 0 KN" },
  { value: "UNDER_1Y", label: "Dưới 1 năm (1 KN)" },
  { value: "1_2Y", label: "1 - 2 kinh nghiệm" },
  { value: "3_5Y", label: "3 - 5 kinh nghiệm" },
  { value: "ABOVE_5Y", label: "Trên 5 kinh nghiệm" },
];

export const SORT_FILTER_OPTIONS: Array<{ value: CandidateSortKey; label: string }> = [
  { value: "applied_desc", label: "Ứng tuyển mới nhất" },
  { value: "applied_asc", label: "Ứng tuyển cũ nhất" },
  { value: "name_asc", label: "Tên ứng viên: A - Z" },
  { value: "name_desc", label: "Tên ứng viên: Z - A" },
];

export function RecruiterCandidatesFilterPanel({
  initialValues,
  onApply,
  onReset,
}: RecruiterCandidatesFilterPanelProps) {
  const [status, setStatus] = useState<RecruiterApplicationStatus | "ALL">(initialValues.status);
  const [fromDate, setFromDate] = useState<string>(initialValues.fromDate);
  const [toDate, setToDate] = useState<string>(initialValues.toDate);
  const [experience, setExperience] = useState<ExperienceFilterKey>(initialValues.experience);
  const [sort, setSort] = useState<CandidateSortKey>(initialValues.sort);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({ status, fromDate, toDate, experience, sort });
  };

  const handleReset = () => {
    setStatus("ALL");
    setFromDate("");
    setToDate("");
    setExperience("ALL");
    setSort("applied_desc");
    onReset();
  };

  const hasActiveFilters =
    status !== "ALL" ||
    fromDate !== "" ||
    toDate !== "" ||
    experience !== "ALL" ||
    sort !== "applied_desc";

  return (
    <form
      onSubmit={handleApply}
      className="border-b border-border bg-background/50 p-4 transition-all animate-in fade-in slide-in-from-top-2"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Trạng thái đơn */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text">
            <UserCheck className="size-3.5 text-primary" /> Trạng thái đơn
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RecruiterApplicationStatus | "ALL")}
            className="w-full cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text outline-none transition focus:border-primary"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Thời gian ứng tuyển: Từ ngày - Đến ngày */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text">
            <Calendar className="size-3.5 text-primary" /> Thời gian ứng tuyển
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              aria-label="Từ ngày"
              title="Từ ngày"
              className="w-full cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text outline-none transition focus:border-primary"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              aria-label="Đến ngày"
              title="Đến ngày"
              className="w-full cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text outline-none transition focus:border-primary"
            />
          </div>
        </div>

        {/* Kinh nghiệm */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text">
            <Briefcase className="size-3.5 text-primary" /> Kinh nghiệm
          </label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value as ExperienceFilterKey)}
            className="w-full cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text outline-none transition focus:border-primary"
          >
            {EXPERIENCE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sắp xếp */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text">
            <Sparkles className="size-3.5 text-primary" /> Sắp xếp theo
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as CandidateSortKey)}
            className="w-full cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text outline-none transition focus:border-primary"
          >
            {SORT_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex cursor-pointer items-center gap-1 text-xs text-muted transition hover:text-danger"
            >
              <RotateCcw className="size-3" /> Đặt lại bộ lọc
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-primary-hover"
          >
            <Check className="size-3.5" /> Áp dụng
          </button>
        </div>
      </div>
    </form>
  );
}
