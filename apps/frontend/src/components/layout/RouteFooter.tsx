"use client";

import { usePathname } from "next/navigation";
import AuthFooter from "./AuthFooter";
import { Footer } from "./footer";

export function RouteFooter() {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/");

  return isAuthRoute ? <AuthFooter /> : <Footer />;
}
