"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Bookmark, Building2, ChevronDown, LogOut, Menu, Search, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { googleLogout } from "@react-oauth/google";
import { ROUTES } from "@/constants/routes";
import {
  getAccessToken,
  getStoredUser,
  setStoredUser,
  type StoredUser,
} from "@/lib/auth-token";
import { cn, resolveStorageUrl } from "@/lib/utils";
import { authApi } from "@/services/auth.service";
import { http } from "@/services/http";
import { notificationsApi } from "@/modules/notifications/api";
import { NotificationDropdown } from "@/modules/notifications/components/notification-dropdown";
import type { ApiSuccess } from "@/types/api";
import Image from "next/image";
import { CandidateSearchBar } from "@/components/layout/candidate-search-bar";

type Session = StoredUser & { role: "CANDIDATE" | "RECRUITER" | "ADMIN" };
const navItems = [
  { href: ROUTES.home, label: "Trang chủ" },
  { href: ROUTES.jobs, label: "Việc làm" },
  { href: "/companies", label: "Công ty" },
];

function useUnreadNotificationCount(isLoggedIn: boolean): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      setCount(0);
      return;
    }

    let cancelled = false;

    const refresh = () => {
      notificationsApi
        .unreadCount()
        .then((res) => {
          if (!cancelled) setCount(res.data.unreadCount);
        })
        .catch(() => {
          // Bỏ qua lỗi hiển thị badge
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
  }, [isLoggedIn]);

  return count;
}

function readSession(): Session | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const encodedPayload = token
      .split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const payload = JSON.parse(atob(encodedPayload)) as {
      email?: string;
      role?: Session["role"];
      exp?: number;
    };
    if (!payload.role || (payload.exp && payload.exp * 1000 <= Date.now()))
      return null;
    const stored = getStoredUser();
    return {
      email: stored?.email || payload.email || "",
      fullName: stored?.fullName || payload.email?.split("@")[0] || "Tài khoản",
      role: payload.role,
      avatar: stored?.avatar || null,
    };
  } catch {
    return null;
  }
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const unreadCount = useUnreadNotificationCount(Boolean(session));

  useEffect(() => {
    // Session data only exists in the browser; update once hydration is complete.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(readSession());
    const syncSession = () => setSession(readSession());
    window.addEventListener("storage", syncSession);
    window.addEventListener("jp-auth-change", syncSession);

    if (getAccessToken()) {
      let active = true;
      http<ApiSuccess<{ avatar: string | null; fullName: string }>>("/users/me")
        .then((res) => {
          if (!active || !res?.data) return;
          const userMe = res.data;
          setSession((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              fullName: userMe.fullName || prev.fullName,
              avatar: userMe.avatar,
            };
          });
          const stored = getStoredUser();
          if (
            stored &&
            (stored.avatar !== userMe.avatar ||
              (userMe.fullName && stored.fullName !== userMe.fullName))
          ) {
            setStoredUser({
              ...stored,
              fullName: userMe.fullName || stored.fullName,
              avatar: userMe.avatar,
            });
          }
        })
        .catch(() => {});
      return () => {
        active = false;
        window.removeEventListener("storage", syncSession);
        window.removeEventListener("jp-auth-change", syncSession);
      };
    }

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("jp-auth-change", syncSession);
    };
  }, []);

  useEffect(() => {
    if (!accountMenuOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountMenuOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // authApi always clears local credentials; continue to the login page
      // even when the server-side session has already expired.
    } finally {
      googleLogout();
      setAccountMenuOpen(false);
      setMenuOpen(false);
      setSession(null);
      setIsLoggingOut(false);
      router.replace(ROUTES.auth.login);
    }
  };

  const profileHref =
    session?.role === "CANDIDATE"
      ? ROUTES.candidate.profile
      : session?.role === "RECRUITER"
        ? ROUTES.recruiter.root
        : null;
  const profileLabel = session?.role === "RECRUITER"
    ? "Trang nhà tuyển dụng"
    : "Hồ sơ cá nhân";

  const notificationHref =
    session?.role === "RECRUITER"
      ? ROUTES.recruiter.notifications
      : ROUTES.notifications.root;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <nav
        className="mx-auto flex h-[68px] w-full container items-center px-4 sm:px-6"
        aria-label="Điều hướng chính"
      >
        <Link
          href={ROUTES.home}
          className="flex shrink-0 items-center gap-2"
          aria-label="JobPlatform - Trang chủ"
        >
          <Image
            src="/logo.png"
            alt="JobPlatform"
            width={40}
            height={40}
            priority
          />
          <span className="text-[18px] font-bold tracking-[-0.03em] text-slate-950">
            Job Platform
          </span>
        </Link>

        <div className="mx-auto hidden h-full items-center gap-14 md:flex lg:gap-20">
          {navItems.map((item) => {
            const active =
              item.href === ROUTES.home
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-full items-center text-sm font-medium text-slate-700 transition-colors hover:text-primary",
                  active && "text-primary",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {!session ? (
            <>
              <CandidateSearchBar className="hidden xl:block" />
              <Link
                href={ROUTES.auth.login}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              >
                Đăng nhập
              </Link>
              <Link
                href={ROUTES.auth.register}
                className="rounded-md bg-[#3367d6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2857bb]"
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              {session.role === "CANDIDATE" && (
                <CandidateSearchBar className="hidden xl:block" />
              )}
              {session.role === "CANDIDATE" && (
                <Link
                  href={ROUTES.applications.savedJobs}
                  className="rounded-md p-1.5 text-slate-700 hover:bg-slate-100"
                  aria-label="Việc làm đã lưu"
                >
                  <Bookmark className="size-[18px]" />
                </Link>
              )}
              <NotificationDropdown
                baseHref={notificationHref}
                unreadCount={unreadCount}
              />
              <div ref={accountMenuRef} className="relative ml-1">
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-md px-1.5 py-1 transition hover:bg-slate-100"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                >
                  <HeaderUserAvatar
                    avatar={session.avatar}
                    fullName={session.fullName}
                  />
                  <span className="max-w-28 truncate text-xs font-medium text-slate-900">
                    {session.fullName}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-slate-500 transition-transform",
                      accountMenuOpen && "rotate-180",
                    )}
                  />
                </button>

                {accountMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
                  >
                    {profileHref && (
                      <Link
                        href={profileHref}
                        role="menuitem"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        {session.role === "RECRUITER" ? (
                          <Building2 className="size-4" />
                        ) : (
                          <User className="size-4" />
                        )}
                        {profileLabel}
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60",
                        profileHref && "mt-1 border-t border-slate-100 pt-2.5",
                      )}
                    >
                      <LogOut className="size-4" />
                      {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          className="ml-auto rounded-md p-2 text-slate-700 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label="Mở menu"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
            {!session ? (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                <Link
                  href={ROUTES.auth.login}
                  className="rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  href={ROUTES.auth.register}
                  className="rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white"
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="mt-3 border-t border-slate-100 pt-3">
                {profileHref ? (
                  <Link
                    href={profileHref}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {session.role === "RECRUITER" ? (
                      <Building2 className="size-4" />
                    ) : (
                      <User className="size-4" />
                    )}
                    {profileLabel}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
                    <HeaderUserAvatar
                      avatar={session.avatar}
                      fullName={session.fullName}
                    />
                    <span>{session.fullName}</span>
                  </div>
                )}
                <Link
                  href={notificationHref}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <Bell className="size-4" />
                    Thông báo
                  </span>
                  {unreadCount > 0 && (
                    <span className="grid min-w-[18px] h-[18px] px-1.5 place-items-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <LogOut className="size-4" />
                  {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function HeaderUserAvatar({
  avatar,
  fullName,
}: {
  avatar?: string | null;
  fullName: string;
}) {
  const [failed, setFailed] = useState(false);
  const avatarUrl = resolveStorageUrl(avatar);
  const initials = fullName.slice(0, 2).toUpperCase() || "TK";

  useEffect(() => {
    setFailed(false);
  }, [avatarUrl]);

  if (avatarUrl && !failed) {
    return (
      <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={fullName}
          className="size-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-300 to-slate-600 text-[10px] font-semibold text-white"
    >
      {initials}
    </span>
  );
}
