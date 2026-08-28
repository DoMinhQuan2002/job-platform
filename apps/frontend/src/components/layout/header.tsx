"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Bookmark, ChevronDown, LogOut, Menu, Search, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/constants/routes";
import {
  getAccessToken,
  getStoredUser,
  type StoredUser,
} from "@/lib/auth-token";
import { cn } from "@/lib/utils";
import { authApi } from "@/services/auth.service";
import Image from "next/image";

type Session = StoredUser & { role: "CANDIDATE" | "RECRUITER" | "ADMIN" };
const navItems = [
  { href: ROUTES.home, label: "Trang chủ" },
  { href: ROUTES.jobs, label: "Việc làm" },
  { href: "/companies", label: "Công ty" },
];

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

  useEffect(() => {
    // Session data only exists in the browser; update once hydration is complete.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(readSession());
    const syncSession = () => setSession(readSession());
    window.addEventListener("storage", syncSession);
    window.addEventListener("jp-auth-change", syncSession);
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
                <label className="relative hidden xl:block">
                  <span className="sr-only">
                    Tìm kiếm việc làm hoặc công ty
                  </span>
                  <input
                    className="h-8 w-[230px] rounded-lg border border-slate-300 bg-slate-50 pl-3 pr-9 text-xs outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Tìm việc làm, công ty..."
                  />
                  <Search className="absolute right-3 top-2 size-4 text-slate-600" />
                </label>
              )}
              <Link
                href={ROUTES.applications.savedJobs}
                className="rounded-md p-1.5 text-slate-700 hover:bg-slate-100"
                aria-label="Việc làm đã lưu"
              >
                <Bookmark className="size-[18px]" />
              </Link>
              <button
                className="relative rounded-md p-1.5 text-slate-700 hover:bg-slate-100"
                aria-label="Thông báo"
              >
                <Bell className="size-[18px]" />
                <span className="absolute -right-0.5 -top-1 grid size-[15px] place-items-center rounded-full bg-red-500 text-[9px] font-semibold text-white">
                  3
                </span>
              </button>
              <div ref={accountMenuRef} className="relative ml-1">
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-md px-1.5 py-1 transition hover:bg-slate-100"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-slate-300 to-slate-600 text-[10px] font-semibold text-white">
                    {session.fullName.slice(0, 2).toUpperCase()}
                  </span>
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
                    {profileHref ? (
                      <Link
                        href={profileHref}
                        role="menuitem"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <User className="size-4" />
                        Hồ sơ cá nhân
                      </Link>
                    ) : null}
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
                {session.role === "CANDIDATE" || session.role === "RECRUITER" ? (
                  <Link
                    href={
                      session.role === "CANDIDATE"
                        ? ROUTES.candidate.profile
                        : ROUTES.recruiter.root
                    }
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <User className="size-4" />
                    Hồ sơ cá nhân
                  </Link>
                ) : (
                  <span className="block rounded-md px-3 py-2 text-sm font-medium">
                    {session.fullName}
                  </span>
                )}
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
