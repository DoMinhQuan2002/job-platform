"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { JobCategory, JobFilters } from "@/modules/jobs/types";

type Props = {
  filters: JobFilters;
  categories: JobCategory[];
  categoriesLoading: boolean;
  onChange: (field: keyof JobFilters, value: string | number) => void;
  onApply: () => void;
  onClear: () => void;
  className?: string;
};
const locations = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ"];
const salaries = [
  { label: "Dưới 5 triệu", min: "", max: "5000000" },
  { label: "5 - 10 triệu", min: "5000000", max: "10000000" },
  { label: "10 - 20 triệu", min: "10000000", max: "20000000" },
  { label: "20 - 30 triệu", min: "20000000", max: "30000000" },
  { label: "Trên 30 triệu", min: "30000000", max: "" },
];

export function JobsFilterPanel({
  filters,
  categories,
  categoriesLoading,
  onChange,
  onApply,
  onClear,
  className = "",
}: Props) {
  return (
    <aside className={cn("lg:sticky lg:top-24 lg:self-start", className)}>
      <div className="rounded-lg border border-border bg-white p-4 lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col lg:overflow-hidden lg:pr-1">
        <div className="mb-5 flex shrink-0 items-center justify-between lg:pr-3">
          <h2 className="text-sm font-bold text-text">Bộ lọc tìm kiếm</h2>
          <Button variant="link" size="xs" onClick={onClear}>
            Xóa tất cả
          </Button>
        </div>
        <div className="min-h-0 flex-1 lg:overflow-y-auto lg:pb-4 lg:pr-3">
        <FilterGroup title="Từ khóa">
          <Input
            value={filters.keyword}
            onChange={(event) => onChange("keyword", event.target.value)}
            placeholder="Nhập từ khóa..."
          />
        </FilterGroup>
        <FilterGroup title="Địa điểm">
          <div className="space-y-2.5">
            <CheckRow
              label="Tất cả địa điểm"
              checked={!filters.location}
              onChange={() => onChange("location", "")}
            />
            {locations.map((item) => (
              <CheckRow
                key={item}
                label={item}
                checked={filters.location === item}
                onChange={() =>
                  onChange("location", filters.location === item ? "" : item)
                }
              />
            ))}
          </div>
          <button className="mt-3 text-xs font-medium text-primary hover:underline">
            Xem thêm
          </button>
        </FilterGroup>
        <FilterGroup title="Ngành nghề">
          <Select
            value={filters.categoryId}
            disabled={categoriesLoading}
            onChange={(event) => onChange("categoryId", event.target.value)}
          >
            <option value="">
              {categoriesLoading
                ? "Đang tải ngành nghề..."
                : "Tất cả ngành nghề"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FilterGroup>
        <FilterGroup title="Hình thức">
          <Select
            value={filters.jobMode}
            onChange={(event) => onChange("jobMode", event.target.value)}
          >
            <option value="">Tất cả hình thức</option>
            <option value="ONSITE">Tại văn phòng</option>
            <option value="REMOTE">Làm từ xa</option>
            <option value="HYBRID">Kết hợp</option>
          </Select>
        </FilterGroup>
        <FilterGroup title="Loại hình">
          <Select
            value={filters.jobType}
            onChange={(event) => onChange("jobType", event.target.value)}
          >
            <option value="">Tất cả loại hình</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
          </Select>
        </FilterGroup>
        <FilterGroup title="Mức lương">
          <div className="space-y-2.5">
            {salaries.map((salary) => (
              <CheckRow
                key={salary.label}
                label={salary.label}
                checked={
                  filters.minSalary === salary.min &&
                  filters.maxSalary === salary.max
                }
                onChange={() => {
                  onChange("minSalary", salary.min);
                  onChange("maxSalary", salary.max);
                }}
              />
            ))}
          </div>
        </FilterGroup>
        </div>
        <div className="shrink-0 border-t border-border bg-white pt-3 lg:pr-3">
          <Button className="h-9 w-full" onClick={onApply}>
            Áp dụng bộ lọc
          </Button>
        </div>
      </div>
    </aside>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h3 className="mb-2.5 text-xs font-semibold text-text">{title}</h3>
      {children}
    </div>
  );
}
function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
      <Checkbox checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
