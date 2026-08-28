"use client";

import { useState, type ReactNode } from "react";
import { RecruiterHeader } from "./recruiter-header";
import { RecruiterSidebar } from "./recruiter-sidebar";

export function RecruiterShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden flex-col bg-background text-text">
      <RecruiterHeader onOpenMenu={() => setMenuOpen(true)} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <RecruiterSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="h-full min-w-0 flex-1 overflow-y-auto p-4 md:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
