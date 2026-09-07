"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  Menu,
  Shield,
  User,
} from "lucide-react";
import { ADMIN_ROUTES } from "@/constants/routes";
import { NotificationsNavIcon, SettingsNavIcon } from "@/components/icons/admin-nav-icons";
import { useAuth } from "@/contexts/auth-context";
import { getAvatarUrl } from "@/lib/media";

const getInitials = (name?: string) => {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onRequestLogout: () => void;
}

export function AdminHeader({
  onToggleSidebar,
  onRequestLogout,
}: AdminHeaderProps) {
  const { currentUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      {/* Left side: Hamburger button on mobile */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none lg:hidden"
          aria-label="Mở menu quản trị"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Right side: Notifications, Settings, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <Link
          href={ADMIN_ROUTES.notifications}
          className="relative flex size-10 items-center justify-center rounded-lg text-[#54647A] hover:bg-slate-50 hover:text-slate-900 transition-colors"
          aria-label="Thông báo"
        >
          <NotificationsNavIcon className="size-5" />
          {/* Red indicator dot matching mockup */}
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-red-500 ring-2 ring-white" />
        </Link>

        {/* Quick Settings Icon */}
        <Link
          href={ADMIN_ROUTES.settings}
          className="flex size-10 items-center justify-center rounded-lg text-[#54647A] hover:bg-slate-50 hover:text-slate-900 transition-colors"
          aria-label="Cài đặt hệ thống"
        >
          <SettingsNavIcon className="size-5" />
        </Link>

        {/* Subtle vertical separator */}
        <div className="mx-1 h-6 w-px bg-slate-200" />

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2.5 rounded-lg py-1 px-1.5 transition-colors hover:bg-slate-50 focus:outline-none cursor-pointer"
          >
            {/* Avatar */}
            {getAvatarUrl(currentUser?.avatar) && !avatarError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getAvatarUrl(currentUser?.avatar)!}
                alt={currentUser?.fullName || "Admin"}
                className="size-9 rounded-full object-cover shadow-xs border border-slate-200"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="grid size-9 place-items-center rounded-full bg-[#00288E] text-xs font-bold text-white shadow-xs">
                {getInitials(currentUser?.fullName || "Admin")}
              </div>
            )}

            <span className="hidden text-sm font-semibold text-slate-800 sm:inline-block max-w-[140px] truncate">
              {currentUser?.fullName || "Admin"}
            </span>

            <ChevronDown
              className={`size-4 text-slate-500 transition-transform duration-150 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-100 z-50"
            >
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {currentUser?.fullName || "Quản trị viên"}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {currentUser?.email || "admin@jobplatform.vn"}
                </p>
              </div>

              <Link
                href={ADMIN_ROUTES.settings}
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <User className="size-4 text-slate-400" />
                <span>Hồ sơ quản trị</span>
              </Link>

              <Link
                href={ADMIN_ROUTES.systemLogs}
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <Shield className="size-4 text-slate-400" />
                <span>Nhật ký bảo mật</span>
              </Link>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setDropdownOpen(false);
                  onRequestLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="size-4 text-red-500" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
