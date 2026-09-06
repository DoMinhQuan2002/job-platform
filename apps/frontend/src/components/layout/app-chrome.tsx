"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuthSession, type AuthRole } from "@/lib/use-auth-session";
import { Header } from "@/components/layout/header";
import { RouteFooter } from "./RouteFooter";
import { cancelTokenRefresh, refreshAccessToken, scheduleTokenRefresh } from "@/lib/token-refresh";
import { isAccessTokenExpired } from "@/lib/auth-token";

type AppChromeProps = Readonly<{
  children: ReactNode;
}>;

const authenticatedDestination = (role: AuthRole) => {
  if (role === "CANDIDATE") return ROUTES.candidate.profile;
  if (role === "RECRUITER") return ROUTES.recruiter.root;
  return ROUTES.home;
};

export function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuthSession();
  const isAuthRoute = pathname === ROUTES.auth.root || pathname.startsWith(`${ROUTES.auth.root}/`);
  const isRecruiterRoute =
    pathname === "/recruiter" || pathname.startsWith("/recruiter/");

   /**
   * Vòng đời token của cả app nằm ở đây.
   * - Mở app: hẹn giờ refresh theo hạn của token hiện tại.
   * - Token đổi (login / refresh / logout): hẹn lại.
   * - Quay lại tab sau khi máy ngủ: setTimeout có thể đã trễ -> refresh ngay.
   */
  useEffect(() => {
    scheduleTokenRefresh();

    const onFocus = () => {
      if (!isAccessTokenExpired()) return;

      void refreshAccessToken().then((token) => {
        if (token) scheduleTokenRefresh();
      });
    };

    window.addEventListener("jp-auth-change", scheduleTokenRefresh);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("jp-auth-change", scheduleTokenRefresh);
      window.removeEventListener("focus", onFocus);
      cancelTokenRefresh();
    };
  }, []);

  useEffect(() => {
    if (isAuthRoute && session) {
      router.replace(authenticatedDestination(session.role));
    }
  }, [isAuthRoute, router, session]);

  if (isAuthRoute && session) {
    return null;
  }

  if (isRecruiterRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="flex-1">{children}</div>
      <RouteFooter />
    </>
  );
}
