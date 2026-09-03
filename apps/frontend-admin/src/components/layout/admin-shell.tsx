"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";
import { LogoutModal } from "./logout-modal";
import { ADMIN_ROUTES } from "@/constants/routes";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Automatically close mobile sidebar on navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false);
  }, [pathname]);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear token from localStorage / cookies if any
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_access_token");
        localStorage.removeItem("admin_user");
        sessionStorage.clear();
      }
    } catch {
      // Ignore storage errors
    } finally {
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
      router.push(ADMIN_ROUTES.login);
    }
  };

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
