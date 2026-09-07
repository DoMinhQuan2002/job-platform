"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BriefcaseBusiness, Building2, CheckCircle2, Headphones, House, LayoutDashboard, Settings, Users, X } from "lucide-react";
import { cn, resolveStorageUrl } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { notificationsApi } from "@/modules/notifications/api";
import { useRecruiterCompany } from "./recruiter-company-context";

/** Polling 30s + lắng nghe "jp-notifications-change" (đọc/xóa từ trang thông báo) */
function useUnreadNotificationCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      notificationsApi
        .unreadCount()
        .then((res) => {
          if (!cancelled) setCount(res.data.unreadCount);
        })
        .catch(() => {
          // Bỏ qua — badge chỉ là tiện ích hiển thị, không chặn sidebar.
        });
    };

    refresh();
    const interval = setInterval(refresh, 30_000);
    window.addEventListener("jp-notifications-change", refresh);
    window.addEventListener("jp-auth-change", refresh);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("jp-notifications-change", refresh);
      window.removeEventListener("jp-auth-change", refresh);
    };
  }, []);

  return count;
}

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isNotification?: boolean;
  badge?: number | string;
};

const baseNavigation: NavigationItem[] = [
  { label: "Tổng quan", href: "/recruiter", icon: LayoutDashboard },
  { label: "Quản lý tin", href: "/recruiter/jobs", icon: BriefcaseBusiness },
  { label: "Quản lý ứng viên", href: ROUTES.recruiter.candidates, icon: Users },
  { label: "Quản lý công ty", href: "/recruiter/company", icon: Building2 },
  { label: "Thông báo", href: ROUTES.recruiter.notifications, icon: Bell, isNotification: true },
  { label: "Tài khoản", href: ROUTES.recruiter.account, icon: Settings },
];

const mobilePublicNavigation = [
  { label: "Trang chủ", href: ROUTES.home, icon: House },
  { label: "Việc làm", href: ROUTES.jobs, icon: BriefcaseBusiness },
  { label: "Công ty", href: ROUTES.companies, icon: Building2 },
];

type RecruiterSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function RecruiterSidebar({ open, onClose }: RecruiterSidebarProps) {
  const pathname = usePathname();
  const { company, loading: companyLoading } = useRecruiterCompany();
  const unreadCount = useUnreadNotificationCount();

  const navigation = baseNavigation.map((item) => {
    if (item.isNotification) {
      return {
        ...item,
        badge: unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : undefined,
      };
    }
    return item;
  });

  return (
    <>
      {/* Mobile: lớp nền đóng drawer khi người dùng chạm ra ngoài. */}
      {open && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
        />
      )}

      {/* Mobile navigation drawer; từ breakpoint lg trở lên trở thành sidebar cố định. */}
      <aside
        id="recruiter-mobile-navigation"
        aria-label="Điều hướng nhà tuyển dụng"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(82vw,320px)] flex-col overflow-y-auto border-r border-border bg-surface shadow-xl transition-transform duration-200 lg:static lg:z-auto lg:h-full lg:min-h-0 lg:w-64 lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button type="button" onClick={onClose} className="absolute right-3 top-3 rounded-md p-1.5 text-muted hover:bg-background lg:hidden" aria-label="Đóng menu">
          <X className="size-5" />
        </button>
        <div className="p-5 text-center">
          <div className="mx-auto mb-3 grid size-16 place-items-center overflow-hidden rounded-full border border-slate-200 bg-primary/10 text-primary">
            {company?.logo && resolveStorageUrl(company.logo) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveStorageUrl(company.logo)}
                alt={company?.name ?? "Logo công ty"}
                className="size-full object-contain p-1"
              />
            ) : (
              <Building2 className="size-7" />
            )}
          </div>
          {companyLoading ? (
            <div className="mx-auto h-5 w-36 animate-pulse rounded bg-border/70" />
          ) : (
            <h2 className="truncate font-bold text-text" title={company?.name}>
              {company?.name ?? "Chưa có hồ sơ công ty"}
            </h2>
          )}
          <span className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">Nhà tuyển dụng</span>
          <div className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-success">
            <CheckCircle2 className="size-4" /> Tài khoản đã xác thực
          </div>
        </div>

        <nav className="flex-1 border-t border-border py-2">
          {navigation.map((item) => {
            const active = item.href === "/recruiter" ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 border-l-4 px-5 py-3 text-sm font-medium transition-colors hover:bg-background",
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-muted hover:text-text",
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge !== null && (
                  <span className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Mobile: điều hướng sang các trang công khai. */}
          <div className="mt-2 border-t border-border pt-2 lg:hidden">
            <p className="mb-1 px-5 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Điều hướng chung
            </p>
            {mobilePublicNavigation.map((item) => {
              const active =
                item.href === ROUTES.home
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 border-l-4 px-5 py-3 text-sm font-medium transition-colors hover:bg-background",
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent text-muted hover:text-text",
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="m-3 rounded-lg border border-border bg-background p-3">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-bold text-text">Bạn cần hỗ trợ?</h3>
            <Headphones className="ml-auto size-5 text-primary" />
          </div>
          <p className="mb-3 text-xs leading-relaxed text-muted">Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
          <button type="button" className="w-full rounded-lg border border-primary/30 bg-surface py-2 text-sm font-medium text-primary hover:bg-primary/5">Liên hệ hỗ trợ</button>
        </div>
      </aside>
    </>
  );
}
