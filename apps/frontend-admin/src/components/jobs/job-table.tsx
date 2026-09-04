"use client";

import { Eye, Trash2, Building2, AlertCircle } from "lucide-react";
import type { AdminJobListItem } from "@/services/admin-jobs.service";

interface JobTableProps {
  jobs: AdminJobListItem[];
  startIndex: number;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewDetail: (job: AdminJobListItem) => void;
  onDelete: (job: AdminJobListItem) => void;
  onApprove?: (job: AdminJobListItem) => void;
  onReject?: (job: AdminJobListItem) => void;
}

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr).slice(0, 10);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateStr);
  }
};

const getCompanyColor = (companyId: string | number) => {
  const colors = [
    "bg-blue-50 text-blue-600",
    "bg-purple-50 text-purple-600",
    "bg-orange-50 text-orange-600",
    "bg-emerald-50 text-emerald-600",
    "bg-indigo-50 text-indigo-600",
    "bg-teal-50 text-teal-600",
  ];
  const num = typeof companyId === "number" ? companyId : parseInt(String(companyId).replace(/\D/g, "") || "0", 10);
  return colors[num % colors.length];
};

export function JobTable({
  jobs,
  startIndex,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewDetail,
  onDelete,
}: JobTableProps) {
  const allSelected =
    jobs.length > 0 && jobs.every((job) => selectedIds.includes(job.id));
  const someSelected =
    jobs.length > 0 &&
    jobs.some((job) => selectedIds.includes(job.id)) &&
    !allSelected;

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          Không tìm thấy tin tuyển dụng nào
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh các bộ lọc trạng thái, công ty hoặc ngành nghề.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse" id="job-table">
        <thead>
          <tr className="border-b border-slate-100 bg-white text-[12px] font-semibold text-slate-700 select-none">
            <th className="py-4 pl-6 pr-2 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                aria-label="Chọn tất cả tin tuyển dụng"
              />
            </th>
            <th className="py-4 px-3 w-12 text-center text-slate-600">STT</th>
            <th className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">Mã tin</th>
            <th className="py-4 px-4 font-semibold text-slate-700">Tiêu đề tin tuyển dụng</th>
            <th className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">Công ty</th>
            <th className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">Ngày đăng</th>
            <th className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">Hạn ứng tuyển</th>
            <th className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">Trạng thái</th>
            <th className="py-4 pr-6 pl-4 font-semibold text-slate-700 text-center whitespace-nowrap">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-[13px]">
          {jobs.map((job, idx) => {
            const isSelected = selectedIds.includes(job.id);
            const displayCode = job.code || `JD-2405-${String(job.id).padStart(3, "0")}`;
            const companyColor = getCompanyColor(job.company?.id || idx);

            return (
              <tr
                key={job.id}
                className={`transition-colors ${
                  isSelected ? "bg-blue-50/40" : "hover:bg-slate-50/70"
                }`}
              >
                {/* Checkbox */}
                <td className="py-4 pl-6 pr-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(job.id)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    aria-label={`Chọn tin ${job.title}`}
                  />
                </td>

                {/* STT */}
                <td className="py-4 px-3 text-center text-slate-500">
                  {startIndex + idx + 1}
                </td>

                {/* Mã tin */}
                <td className="py-4 px-4 font-medium text-slate-700 whitespace-nowrap">
                  {displayCode}
                </td>

                {/* Tiêu đề tin tuyển dụng */}
                <td className="py-4 px-4 min-w-[220px]">
                  <button
                    type="button"
                    onClick={() => onViewDetail(job)}
                    className="font-semibold text-blue-600 hover:underline text-left block leading-tight cursor-pointer"
                  >
                    {job.title}
                  </button>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    {job.category?.name || "Khác"}
                  </span>
                </td>

                {/* Công ty */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${companyColor}`}
                    >
                      <Building2 className="w-4 h-4" />
                    </span>
                    <span className="font-medium text-slate-700">
                      {job.company?.name || "Chưa cập nhật"}
                    </span>
                  </div>
                </td>

                {/* Ngày đăng */}
                <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                  {formatDate(job.createdAt)}
                </td>

                {/* Hạn ứng tuyển */}
                <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                  {formatDate(job.deadline)}
                </td>

                {/* Trạng thái */}
                <td className="py-4 px-4 whitespace-nowrap">
                  {job.status === "APPROVED" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Đã duyệt
                    </span>
                  )}
                  {job.status === "PENDING" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
                      Chờ duyệt
                    </span>
                  )}
                  {job.status === "REJECTED" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100">
                      Từ chối
                    </span>
                  )}
                  {job.status === "CLOSED" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      Hết hạn
                    </span>
                  )}
                </td>

                {/* Thao tác */}
                <td className="py-4 pr-6 pl-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2.5">
                    {/* Xem chi tiết */}
                    <button
                      type="button"
                      onClick={() => onViewDetail(job)}
                      className="text-slate-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50/50 transition-colors cursor-pointer"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Xóa tin */}
                    <button
                      type="button"
                      onClick={() => onDelete(job)}
                      className="text-rose-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa tin tuyển dụng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
