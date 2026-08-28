"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { RouteFooter } from "./RouteFooter";

type AppChromeProps = Readonly<{
  children: ReactNode;
}>;

export function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const isRecruiterRoute =
    pathname === "/recruiter" || pathname.startsWith("/recruiter/");

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
