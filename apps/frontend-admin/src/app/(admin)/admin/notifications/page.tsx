import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Bell, CheckCheck } from "lucide-react";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Thông báo"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Thông báo" },
        ]}
        actions={
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <CheckCheck className="size-3.5 text-slate-500" />
            <span>Đánh dấu đã đọc tất cả</span>
          </button>
        }
      />

      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xs">
        <Bell className="mx-auto size-12 text-slate-300" />
        <h3 className="mt-3 text-base font-bold text-slate-800">
          Trung tâm thông báo hệ thống
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Các thông báo quan trọng về tài khoản mới, báo cáo vi phạm và cảnh báo hệ thống.
        </p>
      </div>
    </div>
  );
}
