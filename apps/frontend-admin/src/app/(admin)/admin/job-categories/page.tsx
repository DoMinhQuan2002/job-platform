import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Layers, Plus } from "lucide-react";

export default function AdminJobCategoriesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý ngành nghề"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Quản lý ngành nghề" },
        ]}
        actions={
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="size-4" />
            <span>Thêm ngành nghề</span>
          </button>
        }
      />

      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xs">
        <Layers className="mx-auto size-12 text-slate-300" />
        <h3 className="mt-3 text-base font-bold text-slate-800">
          Danh mục ngành nghề & lĩnh vực hoạt động
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Tạo mới, chỉnh sửa và cấu hình trạng thái hoạt động cho danh mục ngành nghề việc làm.
        </p>
      </div>
    </div>
  );
}
