"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AdminHeader } from "./admin-header";
import { AdminLayoutSkeleton } from "./admin-layout-skeleton";
import { AdminSidebar } from "./admin-sidebar";
import { LogoutModal } from "./logout-modal";
import { ADMIN_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";
import { clearAccessToken, isAccessTokenExpired } from "@/lib/auth-token";
import {
  cancelTokenRefresh,
  refreshAccessToken,
  scheduleTokenRefresh,
} from "@/lib/token-refresh";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Đóng sidebar trên mobile khi chuyển route
  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) setSidebarOpen(false);
    });
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const role = currentUser?.role;

  // Kiểm tra quyền và quản lý vòng đời refresh token khi xem trang
  useEffect(() => {
    if (isLoading || isLoggingOut) return;

    if (!isAuthenticated || role !== "ADMIN") {
      clearAccessToken();
      router.replace(ADMIN_ROUTES.login + "?reason=session_expired");
      return;
    }

    scheduleTokenRefresh();

    const onFocus = () => {
      if (isLoggingOut) return;
      if (!isAccessTokenExpired()) return;

      void refreshAccessToken().then((token) => {
        if (token) {
          scheduleTokenRefresh();
        } else if (!isLoggingOut) {
          clearAccessToken();
          router.replace(ADMIN_ROUTES.login + "?reason=session_expired");
        }
      });
    };

    window.addEventListener("jp-admin-auth-change", scheduleTokenRefresh);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("jp-admin-auth-change", scheduleTokenRefresh);
      window.removeEventListener("focus", onFocus);
      cancelTokenRefresh();
    };
  }, [isLoading, isAuthenticated, role, router, isLoggingOut]);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // Bỏ qua lỗi API logout
    }
    router.replace(ADMIN_ROUTES.login);
  };

  // 1. Màn hình Chờ khi F5 hoặc lần đầu vào trang
  if (isLoading) {
    return <AdminLayoutSkeleton />;
  }

  // 2. Chưa xác thực hoặc không có quyền Admin (ngoại trừ khi đang trong luồng đăng xuất)
  if ((!isAuthenticated || currentUser?.role !== "ADMIN") && !isLoggingOut) {
    return null;
  }

  // 3. Đã xác thực thành công -> Render Dashboard
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-slate-900">
      {/* Left Sidebar: 260px */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onRequestLogout={() => setLogoutModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header: 72px */}
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onRequestLogout={() => setLogoutModalOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );
}
