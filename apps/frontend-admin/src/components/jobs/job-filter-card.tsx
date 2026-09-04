"use client";

import { useState } from "react";
import { Search, ChevronDown, Calendar, Filter, RotateCcw } from "lucide-react";
import type {
  AdminJobStatus,
  CompanyOption,
  JobCategoryOption,
} from "@/services/admin-jobs.service";

export interface JobFilterValues {
  search: string;
  companyId: string;
  status: "" | AdminJobStatus;
  categoryId: string;
  startDate: string;
  endDate: string;
}

interface JobFilterCardProps {
  categories: JobCategoryOption[];
  companies: CompanyOption[];
  initialValues: JobFilterValues;
  onFilter: (values: JobFilterValues) => void;
  onReset: () => void;
}

export function JobFilterCard({
  categories,
  companies,
  initialValues,
  onFilter,
  onReset,
}: JobFilterCardProps) {
  const [formValues, setFormValues] = useState<JobFilterValues>(initialValues);

  const handleChange = (field: keyof JobFilterValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(formValues);
  };

  const handleReset = () => {
    const emptyValues: JobFilterValues = {
      search: "",
      companyId: "",
      status: "",
      categoryId: "",
      startDate: "",
      endDate: "",
    };
    setFormValues(emptyValues);
    onReset();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4"
      data-purpose="filter-card"
    >
      {/* Row 1: Search & Selection Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Keyword Search */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tìm kiếm
          </label>
          <div className="relative">
            <input
              type="text"
              value={formValues.search}
              onChange={(e) => handleChange("search", e.target.value)}
              placeholder="Tìm theo tiêu đề, mã tin, công ty..."
              className="w-full h-10 pr-9 pl-3.5 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 bg-white transition-colors outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Company Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Công ty
          </label>
          <div className="relative">
            <select
              value={formValues.companyId}
              onChange={(e) => handleChange("companyId", e.target.value)}
              className="w-full h-10 px-3 pr-8 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 appearance-none outline-none transition-colors"
            >
              <option value="">Tất cả công ty</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Trạng thái
          </label>
          <div className="relative">
            <select
              value={formValues.status}
              onChange={(e) =>
                handleChange("status", e.target.value as "" | AdminJobStatus)
              }
              className="w-full h-10 px-3 pr-8 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 appearance-none outline-none transition-colors"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
              <option value="CLOSED">Hết hạn</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Ngành nghề
          </label>
          <div className="relative">
            <select
              value={formValues.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              className="w-full h-10 px-3 pr-8 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 appearance-none outline-none transition-colors"
            >
              <option value="">Tất cả ngành nghề</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 2: Date Filters & Action Buttons */}
      <div className="flex flex-wrap items-end justify-between gap-4 pt-1">
        <div className="flex flex-wrap items-center gap-4">
          {/* Start Date */}
          <div className="w-48">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ngày đăng từ
            </label>
            <div className="relative">
              <input
                type="date"
                value={formValues.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full h-10 px-3 pr-8 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 bg-white outline-none transition-colors"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* End Date */}
          <div className="w-48">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ngày đăng đến
            </label>
            <div className="relative">
              <input
                type="date"
                value={formValues.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full h-10 px-3 pr-8 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 bg-white outline-none transition-colors"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="h-10 px-5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors mt-auto flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>

          {/* Submit Filter Button */}
          <button
            type="submit"
            className="h-10 px-5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-colors mt-auto"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc</span>
          </button>
        </div>
      </div>
    </form>
  );
}
