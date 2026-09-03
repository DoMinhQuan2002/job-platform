"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { googleLogout } from "@react-oauth/google";
import { Bell, ChevronDown, LogOut, Menu, Search, UserRound } from "lucide-react";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/services/auth.service";
import { useRecruiterCompany } from "./recruiter-company-context";

type RecruiterHeaderProps = {
  menuOpen: boolean;
  onOpenMenu: () => void;
};

const navItems = [
  { href: ROUTES.home, label: "Trang chủ" },
  { href: ROUTES.jobs, label: "Việc làm" },
  { href: ROUTES.companies, label: "Công ty" },
];

export function RecruiterHeader({ menuOpen, onOpenMenu }: RecruiterHeaderProps) {
  const router = useRouter();
  const { company, loading: companyLoading } = useRecruiterCompany();
  const [accountOpen, setAccountOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const companyName = companyLoading ? "Đang tải..." : company?.name ?? "Chưa có công ty";
  const companyInitials = company?.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "CT";

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // Local credentials are always cleared by authApi.
    } finally {
      googleLogout();
      router.replace(ROUTES.auth.login);
    }
  };

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-slate-200 bg-white">
      <nav
        className="flex h-[68px] w-full items-center px-4 sm:px-6"
        aria-label="Điều hướng chính"
      >
        {/* Mobile: nút mở recruiter sidebar, ẩn từ breakpoint lg. */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="mr-2 rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Mở menu quản trị"
          aria-controls="recruiter-mobile-navigation"
          aria-expanded={menuOpen}
        >
          <Menu className="size-5" />
        </button>

        <Link
          href={ROUTES.recruiter.root}
          className="flex shrink-0 items-center gap-2"
          aria-label="JobPlatform - Tổng quan tuyển dụng"
        >
          <Image src="/logo.png" alt="JobPlatform" width={40} height={40} priority />
          <span className="text-[18px] font-bold tracking-[-0.03em] text-slate-950">
            JobPlatform
          </span>
        </Link>

        {/* Desktop/tablet: menu điều hướng chính, ẩn trên mobile. */}
        <div className="mx-auto hidden h-full items-center gap-10 md:flex lg:gap-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex h-full items-center text-sm font-medium text-slate-700 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Các thao tác bên phải dùng chung cho desktop và mobile. */}
        <div className="ml-auto flex items-center gap-3">
          {/* Desktop lớn: ô tìm kiếm, ẩn dưới breakpoint xl. */}
          <label className="relative hidden xl:block">
            <span className="sr-only">Tìm kiếm việc làm hoặc công ty</span>
            <input
              className="h-8 w-[230px] rounded-lg border border-slate-300 bg-slate-50 pl-3 pr-9 text-xs outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="Tìm việc làm, công ty..."
            />
            <Search className="absolute right-3 top-2 size-4 text-slate-600" />
          </label>

          <button
            type="button"
            className="relative rounded-md p-1.5 text-slate-700 hover:bg-slate-100"
            aria-label="Thông báo"
          >
            <Bell className="size-[18px]" />
            <span className="absolute -right-0.5 -top-1 grid size-[15px] place-items-center rounded-full bg-red-500 text-[9px] font-semibold text-white">
              5
            </span>
          </button>

          {/* Mobile chỉ hiện avatar; từ sm trở lên hiện thêm tên và mũi tên. */}
          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              className="flex items-center gap-2 rounded-md px-1.5 py-1 transition hover:bg-slate-100"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
            >
              <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-slate-300 to-slate-600 text-[10px] font-semibold text-white">
                {companyInitials}
              </span>
              <span
                className="hidden max-w-32 truncate text-xs font-medium text-slate-900 sm:block"
                title={company?.name}
              >
                {companyName}
              </span>
              <ChevronDown
                className={`hidden size-3.5 text-slate-500 transition-transform sm:block ${accountOpen ? "rotate-180" : ""}`}
              />
            </button>

            {accountOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut className="size-4" />
                  {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
