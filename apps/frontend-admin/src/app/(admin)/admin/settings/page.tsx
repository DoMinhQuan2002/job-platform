import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Settings, Shield, User, BellRing } from "lucide-react";

export default function AdminSettingsPage() {
  const sections = [
    { title: "Thông tin tài khoản", desc: "Cập nhật họ tên, email và ảnh đại diện quản trị viên", icon: User },
    { title: "Bảo mật & Mật khẩu", desc: "Đổi mật khẩu và thiết lập xác thực hai yếu tố (2FA)", icon: Shield },
    { title: "Cấu hình thông báo", desc: "Tùy chỉnh thông báo qua email và thông báo đẩy trong hệ thống", icon: BellRing },
    { title: "Tham số hệ thống", desc: "Các quy định kiểm duyệt, giới hạn số lần thử và thông số bảo trì", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cài đặt hệ thống"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Cài đặt" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs hover:border-blue-200 transition-colors cursor-pointer"
            >
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Icon className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
