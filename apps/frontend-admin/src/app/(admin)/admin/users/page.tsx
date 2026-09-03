import { AdminPageHeader } from "@/components/layout/admin-page-header";
import {
  CheckCircle2,
  Lock,
  Search,
  UserPlus,
  Users,
  Filter,
  Eye,
  LockKeyhole,
} from "lucide-react";

export default function AdminUsersPage() {
  const stats = [
    {
      title: "Tổng người dùng",
      value: "2,486",
      subtitle: "Tất cả tài khoản",
      icon: Users,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Đang hoạt động",
      value: "2,156",
      subtitle: "86.7% tổng số",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Đang bị khóa",
      value: "215",
      subtitle: "8.6% tổng số",
      icon: Lock,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Mới trong 30 ngày",
      value: "124",
      subtitle: "5.0% tổng số",
      icon: UserPlus,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const sampleUsers = [
    {
      id: "USR-10001",
      initials: "NT",
      initialBg: "bg-blue-600",
      name: "Nguyễn Văn Tùng",
      role: "Ứng viên",
      roleType: "candidate",
      email: "tung.nguyen@gmail.com",
      phone: "0907 654 321",
      status: "ACTIVE",
      statusLabel: "Đang hoạt động",
      createdAt: "20/08/2026",
    },
    {
      id: "USR-10002",
      initials: "PT",
      initialBg: "bg-teal-600",
      name: "Phạm Thị Hương",
      role: "Ứng viên",
      roleType: "candidate",
      email: "huongpham@gmail.com",
      phone: "0976 123 456",
      status: "ACTIVE",
      statusLabel: "Đang hoạt động",
      createdAt: "19/08/2026",
    },
    {
      id: "COM-20001",
      initials: "CT",
      initialBg: "bg-purple-600",
      name: "Công ty TNHH ABC",
      role: "Nhà tuyển dụng",
      roleType: "recruiter",
      email: "hr@abc.com",
      phone: "028 1234 5678",
      status: "ACTIVE",
      statusLabel: "Đang hoạt động",
      createdAt: "18/08/2026",
    },
    {
      id: "USR-10003",
      initials: "LT",
      initialBg: "bg-orange-600",
      name: "Lê Minh Tuấn",
      role: "Ứng viên",
      roleType: "candidate",
      email: "tuanle@gmail.com",
      phone: "0934 567 890",
      status: "BANNED",
      statusLabel: "Đang bị khóa",
      createdAt: "17/08/2026",
    },
    {
      id: "COM-20002",
      initials: "DN",
      initialBg: "bg-emerald-600",
      name: "Công ty CP XYZ",
      role: "Nhà tuyển dụng",
      roleType: "recruiter",
      email: "admin@xyz.com",
      phone: "024 9876 5432",
      status: "ACTIVE",
      statusLabel: "Đang hoạt động",
      createdAt: "16/08/2026",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Quản lý người dùng"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Quản lý người dùng" },
        ]}
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs"
            >
              <div
                className={`grid size-12 shrink-0 place-items-center rounded-2xl ${stat.bgColor} ${stat.iconColor}`}
              >
                <Icon className="size-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{stat.title}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>

          {/* Vai trò */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Vai trò:</span>
            <select className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white">
              <option>Tất cả</option>
              <option>Ứng viên</option>
              <option>Nhà tuyển dụng</option>
              <option>Admin</option>
            </select>
          </div>

          {/* Trạng thái */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Trạng thái:</span>
            <select className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white">
              <option>Tất cả</option>
              <option>Đang hoạt động</option>
              <option>Đang bị khóa</option>
            </select>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-blue-100/70 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Filter className="size-3.5" />
            <span>Lọc</span>
          </button>
          <button
            type="button"
            className="rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Người dùng</th>
                <th className="px-5 py-3.5 font-semibold">Vai trò</th>
                <th className="px-5 py-3.5 font-semibold">Email / SĐT</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 font-semibold">Ngày đăng ký</th>
                <th className="px-5 py-3.5 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sampleUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid size-9 place-items-center rounded-full ${user.initialBg} text-xs font-bold text-white shadow-xs`}
                      >
                        {user.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-400">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        user.roleType === "recruiter"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">{user.email}</p>
                    <p className="text-[11px] text-slate-400">{user.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        user.status === "ACTIVE"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          user.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      {user.statusLabel}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{user.createdAt}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button
                        type="button"
                        className="rounded-md p-1 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-1 hover:bg-slate-100 hover:text-red-600 transition-colors"
                        title="Khóa / Mở khóa"
                      >
                        <LockKeyhole className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span>trên mỗi trang</span>
          </div>

          <div className="flex items-center gap-1">
            <button className="grid size-7 place-items-center rounded-lg bg-blue-600 text-xs font-semibold text-white">
              1
            </button>
            <button className="grid size-7 place-items-center rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100">
              2
            </button>
            <button className="grid size-7 place-items-center rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100">
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button className="grid size-7 place-items-center rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100">
              25
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
