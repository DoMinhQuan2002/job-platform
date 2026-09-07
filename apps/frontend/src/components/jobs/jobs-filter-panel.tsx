"use client";

import { useState } from "react";
import { X, Search, Check } from "lucide-react";
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

const defaultLocations = ["Hà Nội", "TP. Hồ Chí Minh", "Thành phố Hồ Chí Minh", "Đà Nẵng", "Cần Thơ"];

const VIETNAM_PROVINCES = [
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Phòng",
  "Huế",
  "Hưng Yên",
  "Khánh Hòa",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "TP. Hồ Chí Minh",
  "Tuyên Quang",
  "Vĩnh Long",
];

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
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  const isCustomLocation = Boolean(
    filters.location && !defaultLocations.includes(filters.location)
  );

  const filteredProvinces = VIETNAM_PROVINCES.filter((p) =>
    p.toLowerCase().includes(locationSearch.toLowerCase().trim())
  );

  const handleSelectProvince = (province: string) => {
    onChange("location", province);
    setIsLocationModalOpen(false);
    setLocationSearch("");
  };

  return (
    <>
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
                {defaultLocations.map((item) => (
                  <CheckRow
                    key={item}
                    label={item}
                    checked={filters.location === item}
                    onChange={() =>
                      onChange("location", filters.location === item ? "" : item)
                    }
                  />
                ))}

                {/* Tỉnh chọn từ Xem thêm hiện ngay dưới Cần Thơ */}
                {isCustomLocation && (
                  <div className="flex items-center justify-between gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2 py-1.5 text-xs font-medium text-primary">
                    <CheckRow
                      label={filters.location}
                      checked={true}
                      onChange={() => onChange("location", "")}
                    />
                    <button
                      type="button"
                      onClick={() => onChange("location", "")}
                      className="shrink-0 rounded p-0.5 text-muted hover:bg-slate-100 hover:text-destructive transition-colors"
                      title="Xóa lựa chọn"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="mt-3 text-xs font-medium text-primary hover:underline"
              >
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

      {/* Modal chọn Tỉnh / Thành phố dùng style chuẩn UI của dự án */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-white p-5 shadow-xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-text">Chọn địa điểm</h3>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="rounded-full p-1 text-muted hover:bg-slate-100 hover:text-text transition-colors"
                aria-label="Đóng modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Ô tìm kiếm trong Modal */}
            <div className="py-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Tìm kiếm tỉnh / thành phố..."
                  className="pl-9"
                  autoFocus
                />
                {locationSearch && (
                  <button
                    type="button"
                    onClick={() => setLocationSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-text"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Danh sách 63 tỉnh thành */}
            <div className="max-h-72 overflow-y-auto py-2 pr-1">
              {filteredProvinces.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted">
                  Không tìm thấy tỉnh / thành phố phù hợp
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredProvinces.map((province) => {
                    const isSelected = filters.location === province;
                    return (
                      <button
                        key={province}
                        type="button"
                        onClick={() => handleSelectProvince(province)}
                        className={cn(
                          "flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-colors text-left",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-white text-text hover:border-primary hover:bg-primary/5 hover:text-primary"
                        )}
                      >
                        <span className="truncate">{province}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted">
                Tổng số: {VIETNAM_PROVINCES.length} tỉnh thành
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLocationModalOpen(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
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
