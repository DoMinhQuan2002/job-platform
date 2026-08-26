"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { CandidateSidebar } from "../components/candidate-sidebar";
import { EducationSection } from "../components/education-section";
import { ExperienceSection } from "../components/experience-section";
import { IntroSection } from "../components/intro-section";
import { SkillsOverview } from "../components/skills-overview";
import { useCandidateProfile } from "../hooks/use-candidate-profile";

export function CandidateProfilePage() {
  const {
    profile,
    account,
    loading,
    error,
    unauthorized,
    saving,
    updateProfile,
    createEducation,
    updateEducation,
    deleteEducation,
    createWorkExperience,
    updateWorkExperience,
    deleteWorkExperience,
  } = useCandidateProfile();

  if (loading) {
    return (
      <main className="mx-auto w-full container px-4 py-8 sm:px-6 2xl:px-0">
        <div className="space-y-4">
          <div className="skeleton h-8 w-64" />
          <div className="skeleton h-96 w-full" />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    const loginHref = `${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.candidate.profile)}`;

    return (
      <main className="mx-auto w-full max-w-lg px-4 py-16">
        <div className="space-y-4 rounded-xl border border-border/50 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">
            {unauthorized ? "Cần đăng nhập" : "Không tải được hồ sơ"}
          </h1>
          <p className="text-sm text-muted">
            {error ?? "Hãy đăng nhập với tài khoản ứng viên (role CANDIDATE)."}
          </p>
          {unauthorized ? (
            <Link
              href={loginHref}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              Đăng nhập
            </Link>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full container flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:py-[30px] 2xl:px-0">
      <CandidateSidebar
        profile={profile}
        displayName={account?.fullName}
        avatarUrl={account?.avatar}
      />

      <div className="min-w-0 flex-1 space-y-5">
        <header className="space-y-2">
          <nav className="flex items-center gap-2 text-[13px] text-muted">
            <Link href={ROUTES.home} className="hover:text-primary">
              Trang chủ
            </Link>
            <ChevronRight className="size-3" />
            <span>Hồ sơ của tôi</span>
          </nav>
          <h1 className="text-2xl font-bold text-foreground">Hồ sơ nghề nghiệp</h1>
          <p className="max-w-xl text-[15px] text-muted">
            Quản lý thông tin giới thiệu, học vấn, kinh nghiệm và kỹ năng của bạn.
          </p>
        </header>

        <IntroSection profile={profile} saving={saving} onSave={updateProfile} />

        <EducationSection
          educations={profile.educations}
          saving={saving}
          onCreate={createEducation}
          onUpdate={updateEducation}
          onDelete={deleteEducation}
        />

        <ExperienceSection
          experiences={profile.workExperiences}
          saving={saving}
          onCreate={createWorkExperience}
          onUpdate={updateWorkExperience}
          onDelete={deleteWorkExperience}
        />

        <SkillsOverview
          skills={profile.skills}
          languages={profile.languages}
          certificates={profile.certificates}
        />
      </div>
    </main>
  );
}
