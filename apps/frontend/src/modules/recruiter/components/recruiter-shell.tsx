"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { RecruiterHeader } from "./recruiter-header";
import { RecruiterSidebar } from "./recruiter-sidebar";
import { RecruiterCompanyProvider } from "./recruiter-company-context";

export function RecruiterShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    desktopMedia.addEventListener("change", closeOnDesktop);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      desktopMedia.removeEventListener("change", closeOnDesktop);
    };
  }, [menuOpen]);

  return (
    <RecruiterCompanyProvider>
      <div className="flex h-dvh overflow-hidden flex-col bg-background text-text">
        <RecruiterHeader
          menuOpen={menuOpen}
          onOpenMenu={() => setMenuOpen(true)}
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <RecruiterSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
          <main className="h-full min-w-0 flex-1 overflow-y-auto p-4 md:p-5 lg:p-6 ">
            {children}
          </main>
        </div>
      </div>
    </RecruiterCompanyProvider>
  );
}
