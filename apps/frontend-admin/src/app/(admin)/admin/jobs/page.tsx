import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Briefcase, CheckCircle, Clock, XCircle } from "lucide-react";

export default function AdminJobsPage() {
  const stats = [
    { title: "Tổng tin đăng", value: "1,150", icon: Briefcase, color: "text-blue-600 bg-blue-50" },
    { title: "Đang hiển thị", value: "980", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
    { title: "Chờ kiểm duyệt", value: "45", icon: Clock, color: "text-amber-600 bg-amber-50" },
    { title: "Đã từ chối / Đóng", value: "125", icon: XCircle, color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý tuyển dụng"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Quản lý tuyển dụng" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs"
            >
              <div className={`grid size-12 place-items-center rounded-2xl ${stat.color}`}>
                <Icon className="size-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{stat.title}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xs">
        <Briefcase className="mx-auto size-12 text-slate-300" />
        <h3 className="mt-3 text-base font-bold text-slate-800">
          Danh sách tin tuyển dụng trên hệ thống
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Kiểm duyệt nội dung tin đăng tuyển, phê duyệt hoặc từ chối tin đăng vi phạm chính sách.
        </p>
      </div>
    </div>
  );
}
