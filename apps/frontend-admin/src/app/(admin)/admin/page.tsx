import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { LayoutDashboard, Users, Building2, Briefcase, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Tổng người dùng", value: "2,486", icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Doanh nghiệp", value: "320", icon: Building2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Tin tuyển dụng", value: "1,150", icon: Briefcase, color: "text-purple-600 bg-purple-50" },
    { label: "Ứng tuyển mới", value: "480", icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Bảng điều khiển"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Tổng quan" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs"
            >
              <div className={`grid size-12 place-items-center rounded-xl ${stat.color}`}>
                <Icon className="size-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-blue-50 text-blue-600">
          <LayoutDashboard className="size-7" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-900">
          Hệ thống Quản trị Job Platform
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Chào mừng bạn đến với trang quản trị. Chọn một mục bên thanh menu để bắt đầu quản lý người dùng, công ty, tin tuyển dụng hoặc cấu hình hệ thống.
        </p>
      </div>
    </div>
  );
}
