"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuthSession, type AuthRole } from "@/lib/use-auth-session";
import { Header } from "@/components/layout/header";
import { RouteFooter } from "./RouteFooter";

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
