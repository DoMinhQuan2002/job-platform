import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Building2, CheckCircle2, Clock, Ban } from "lucide-react";

export default function AdminCompaniesPage() {
  const stats = [
    { title: "Tổng công ty", value: "320", icon: Building2, color: "text-blue-600 bg-blue-50" },
    { title: "Đang hoạt động", value: "285", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { title: "Chờ phê duyệt", value: "23", icon: Clock, color: "text-amber-600 bg-amber-50" },
    { title: "Bị từ chối / Khóa", value: "12", icon: Ban, color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý công ty"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Quản lý công ty" },
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
        <Building2 className="mx-auto size-12 text-slate-300" />
        <h3 className="mt-3 text-base font-bold text-slate-800">
          Danh sách doanh nghiệp & hồ sơ công ty
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Khu vực phê duyệt đăng ký công ty mới, khóa hoặc mở khóa tài khoản doanh nghiệp.
        </p>
      </div>
    </div>
  );
}
