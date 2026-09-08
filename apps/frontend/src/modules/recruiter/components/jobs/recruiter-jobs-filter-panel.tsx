"use client";

import { Check, DollarSign, MapPin, RotateCcw, Search, Sparkles } from "lucide-react";
import { useState } from "react";

export type SalaryRangeKey = "ALL" | "UNDER_10M" | "10M_20M" | "20M_30M" | "ABOVE_30M" | "NEGOTIABLE";

export type JobSortKey = "newest" | "oldest" | "deadline_asc" | "salary_desc" | "salary_asc";

export interface RecruiterJobsFilterValues {
  salaryRange: SalaryRangeKey;
  location: string;
  sort: JobSortKey;
}

interface RecruiterJobsFilterPanelProps {
  initialValues: RecruiterJobsFilterValues;
  onApply: (values: RecruiterJobsFilterValues) => void;
  onReset: () => void;
}

const SALARY_OPTIONS: Array<{ key: SalaryRangeKey; label: string }> = [
  { key: "ALL", label: "Tất cả mức lương" },
  { key: "UNDER_10M", label: "Dưới 10 triệu" },
  { key: "10M_20M", label: "10 - 20 triệu" },
  { key: "20M_30M", label: "20 - 30 triệu" },
  { key: "ABOVE_30M", label: "Trên 30 triệu" },
  { key: "NEGOTIABLE", label: "Lương thỏa thuận" },
];

const POPULAR_LOCATIONS = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Bình Dương",
  "Cần Thơ",
  "Hải Phòng",
];

const SORT_OPTIONS: Array<{ key: JobSortKey; label: string }> = [
  { key: "newest", label: "Tin mới nhất" },
  { key: "oldest", label: "Tin cũ nhất" },
  { key: "deadline_asc", label: "Hạn nộp gần nhất" },
  { key: "salary_desc", label: "Lương cao nhất" },
  { key: "salary_asc", label: "Lương thấp nhất" },
];

export function RecruiterJobsFilterPanel({
  initialValues,
  onApply,
  onReset,
}: RecruiterJobsFilterPanelProps) {
  const [salaryRange, setSalaryRange] = useState<SalaryRangeKey>(initialValues.salaryRange);
  const [location, setLocation] = useState<string>(initialValues.location);
  const [sort, setSort] = useState<JobSortKey>(initialValues.sort);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({ salaryRange, location, sort });
  };

  const handleReset = () => {
    setSalaryRange("ALL");
    setLocation("");
    setSort("newest");
    onReset();
  };

  const handleQuickLocation = (loc: string) => {
    setLocation(loc === location ? "" : loc);
  };

  const hasActiveFilters =
    salaryRange !== "ALL" || location.trim() !== "" || sort !== "newest";

  return (
    <form
      onSubmit={handleApply}
      className="border-b border-border bg-background/50 p-4 transition-all animate-in fade-in slide-in-from-top-2"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Mức lương */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text">
            <DollarSign className="size-3.5 text-primary" /> Mức lương
          </label>
          <select
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value as SalaryRangeKey)}
            className="w-full cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text outline-none transition focus:border-primary"
          >
            {SALARY_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Địa điểm */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text">
            <MapPin className="size-3.5 text-primary" /> Địa điểm làm việc
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Nhập tỉnh/thành hoặc quận/huyện..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-xs text-text outline-none transition focus:border-primary placeholder:text-muted/70"
            />
          </div>
          {/* Gợi ý nhanh */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-muted">Gợi ý nhanh:</span>
            {POPULAR_LOCATIONS.map((loc) => {
              const isSelected = location.toLowerCase().includes(loc.toLowerCase());
              return (
                <button
                  type="button"
                  key={loc}
                  onClick={() => handleQuickLocation(loc)}
                  className={`cursor-pointer rounded-full border px-2 py-0.5 text-[10px] transition ${
                    isSelected
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "border-border bg-surface text-muted hover:border-primary/40 hover:text-text"
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sắp xếp */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text">
            <Sparkles className="size-3.5 text-primary" /> Sắp xếp
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as JobSortKey)}
            className="w-full cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text outline-none transition focus:border-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Buttons hành động */}
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex cursor-pointer items-center gap-1 text-xs text-muted hover:text-danger"
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
