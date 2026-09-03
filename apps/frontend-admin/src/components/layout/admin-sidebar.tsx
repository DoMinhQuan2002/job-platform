"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_ROUTES } from "@/constants/routes";
import {
  BrandLogoIcon,
  DashboardNavIcon,
  UsersNavIcon,
  CompaniesNavIcon,
  JobsNavIcon,
  CategoriesNavIcon,
  SystemLogsNavIcon,
  NotificationsNavIcon,
  SettingsNavIcon,
} from "@/components/icons/admin-nav-icons";

const menuItems = [
  {
    label: "Bảng điều khiển",
    href: ADMIN_ROUTES.dashboard,
    icon: DashboardNavIcon,
    exact: true,
  },
  {
    label: "Quản lý người dùng",
    href: ADMIN_ROUTES.users,
    icon: UsersNavIcon,
  },
  {
    label: "Quản lý công ty",
    href: ADMIN_ROUTES.companies,
    icon: CompaniesNavIcon,
  },
  {
    label: "Quản lý tuyển dụng",
    href: ADMIN_ROUTES.jobs,
    icon: JobsNavIcon,
  },
  {
    label: "Quản lý ngành nghề",
    href: ADMIN_ROUTES.jobCategories,
    icon: CategoriesNavIcon,
  },
  {
    label: "Nhật ký hệ thống",
    href: ADMIN_ROUTES.systemLogs,
    icon: SystemLogsNavIcon,
  },
  {
    label: "Thông báo",
    href: ADMIN_ROUTES.notifications,
    icon: NotificationsNavIcon,
  },
  {
    label: "Cài đặt",
    href: ADMIN_ROUTES.settings,
    icon: SettingsNavIcon,
  },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  onRequestLogout: () => void;
}

export function AdminSidebar({
  open,
  onClose,
  onRequestLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        aria-label="Admin Sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200/80 bg-white shadow-lg transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:h-full lg:min-h-0 lg:w-[260px] lg:shrink-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header: 72px */}
        <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center text-[#00288E]">
              <BrandLogoIcon className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-wide text-[#00288E] uppercase">
                JOB PLATFORM
              </span>
              <span className="text-xs font-normal text-[#54647A]">
                Hệ thống quản trị
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {menuItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors border-l-4",
                  isActive
                    ? "border-[#00288E] bg-[#EEF2FF] text-[#00288E] font-semibold"
                    : "border-transparent text-[#54647A] hover:bg-slate-50 hover:text-[#1E293B]"
                )}
              >
                <div className="flex size-5 items-center justify-center shrink-0">
                  <Icon
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "text-[#00288E]"
                        : "text-[#54647A] group-hover:text-[#1E293B]"
                    )}
                  />
                </div>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Area: Logout */}
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestLogout();
            }}
            className="group flex w-full items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#54647A] transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-[18px] text-[#54647A] transition-colors group-hover:text-red-600" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
