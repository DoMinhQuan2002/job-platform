"use client";

import type { ReactNode } from "react";
import {
  ConnectedCandidateSidebar,
  type ConnectedCandidateSidebarProps,
} from "./connected-candidate-sidebar";

type CandidateWorkspaceLayoutProps = {
  children: ReactNode;
  sidebarProps?: ConnectedCandidateSidebarProps;
  contentClassName?: string;
};

/** Shell sidebar + content — đồng bộ profile / resume / applications */
export function CandidateWorkspaceLayout({
  children,
  sidebarProps,
  contentClassName,
}: CandidateWorkspaceLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto flex w-full container flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:py-[30px] 2xl:px-0">
        <ConnectedCandidateSidebar {...sidebarProps} />
        <div className={`min-w-0 flex-1 space-y-5 ${contentClassName ?? ""}`}>{children}</div>
      </div>
    </main>
  );
}
