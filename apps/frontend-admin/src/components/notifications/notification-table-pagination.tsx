import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select } from "@/components/ui/select";

interface NotificationTablePaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function NotificationTablePagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: NotificationTablePaginationProps) {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-500 font-normal"
      data-purpose="pagination"
    >
      <div>
        Hiển thị {start} - {end} của {total.toLocaleString("vi-VN")} thông báo
      </div>

      <div className="flex items-center gap-3">
        {/* Page size selector */}
        <div className="w-28">
          <Select
            value={String(limit)}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            size="sm"
          >
            <option value="10">10 / trang</option>
            <option value="20">20 / trang</option>
            <option value="50">50 / trang</option>
          </Select>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1.5">
          {/* Prev Button */}
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex size-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Trang trước"
          >
            <ChevronLeft className="size-4" />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((item, idx) => {
            if (item === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                  ...
                </span>
              );
            }

            const pNum = item as number;
            const isActive = pNum === page;

            return (
              <button
                key={pNum}
                type="button"
                onClick={() => onPageChange(pNum)}
                className={`flex size-8 items-center justify-center rounded-xl text-xs font-semibold shadow-2xs transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-blue-500/20"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {pNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex size-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Trang sau"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
