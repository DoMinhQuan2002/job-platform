import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { FileClock, RefreshCw } from "lucide-react";

export default function AdminSystemLogsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Nhật ký hệ thống"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Nhật ký hệ thống" },
        ]}
        actions={
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="size-3.5 text-slate-500" />
            <span>Làm mới log</span>
          </button>
        }
      />

      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xs">
        <FileClock className="mx-auto size-12 text-slate-300" />
        <h3 className="mt-3 text-base font-bold text-slate-800">
          Lịch sử thao tác & Nhật ký hệ thống
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Ghi nhận toàn bộ thao tác duyệt bài, khóa tài khoản, can thiệp dữ liệu của ban quản trị.
        </p>
      </div>
    </div>
  );
}
