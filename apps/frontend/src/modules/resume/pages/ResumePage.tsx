"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { ConnectedCandidateSidebar } from "@/modules/candidate/components/connected-candidate-sidebar";
import { ResumeManager } from "../components/ResumeManager";
import { CandidateSkillsSection } from "../components/CandidateSkillsSection";

export function ResumePage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto flex w-full container flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:py-[30px] 2xl:px-0">
        <ConnectedCandidateSidebar />

        <div className="min-w-0 flex-1 space-y-8">
          <div>
            <nav className="mb-2 flex items-center gap-1.5 text-[13px] text-muted">
              <Link
                href={ROUTES.home}
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                <Home className="size-3.5" />
                Trang chủ
              </Link>
              <ChevronRight className="size-3" />
              <span className="font-semibold text-foreground">Quản lý CV</span>
            </nav>
            <ResumeManager />
          </div>

          <div className="border-t border-border/50 pt-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-bold text-foreground">Kỹ năng & chứng chỉ</h2>
              <p className="text-sm text-muted-foreground">
                Quản lý kỹ năng, ngoại ngữ và chứng chỉ trên hồ sơ của bạn.
              </p>
            </div>
            <CandidateSkillsSection />
          </div>
        </div>
      </div>
    </main>
  );
}
