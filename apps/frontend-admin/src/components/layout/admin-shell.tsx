"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AdminHeader } from "./admin-header";
import { AdminLayoutSkeleton } from "./admin-layout-skeleton";
import { AdminSidebar } from "./admin-sidebar";
import { LogoutModal } from "./logout-modal";
import { ADMIN_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";
import {
  clearAccessToken,
  getAccessToken,
  isTokenExpired,
} from "@/lib/auth-token";
import { refreshAccessToken } from "@/services/http";

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

  // Kiểm tra quyền và tự động làm mới token định kỳ khi đang duyệt trang
  useEffect(() => {
    if (isLoading || isLoggingOut) return;

    if (!isAuthenticated || role !== "ADMIN") {
      clearAccessToken();
      router.replace(ADMIN_ROUTES.login + "?reason=session_expired");
      return;
    }

    const checkAndRefreshToken = async () => {
      if (isLoggingOut) return;
      const token = getAccessToken();
      if (!token || isTokenExpired(token)) {
        const refreshed = await refreshAccessToken();
        if (!refreshed && !isLoggingOut) {
          clearAccessToken();
          router.replace(ADMIN_ROUTES.login + "?reason=session_expired");
        }
      }
    };

    // Kiểm tra mỗi 10 giây
    const interval = setInterval(() => {
      checkAndRefreshToken();
    }, 10000);

    // Kiểm tra ngay khi người dùng mở lại tab trình duyệt
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndRefreshToken();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoading, isAuthenticated, role, router, isLoggingOut]);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    setLogoutModalOpen(false);
    try {
      await logout();
    } catch {
      // Bỏ qua lỗi API logout
    }
    router.replace(ADMIN_ROUTES.login);
  };

  // 1. Màn hình Chờ khi F5 hoặc lần đầu vào trang, hoặc khi đang xử lý đăng xuất
  if (isLoading || isLoggingOut) {
    return <AdminLayoutSkeleton />;
  }

  // 2. Chưa xác thực hoặc không có quyền Admin
  if (!isAuthenticated || currentUser?.role !== "ADMIN") {
    return null;
  }

  // 3. Đã xác thực thành công -> Render Dashboard
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#f8fafc] text-slate-900">
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
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 lg:p-8">
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
