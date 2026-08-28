"use client";

import { CandidateSidebar } from "./candidate-sidebar";
import { useCandidateSidebarData } from "../hooks/use-candidate-sidebar-data";
import type { CandidateProfile } from "../types";

export type ConnectedCandidateSidebarProps = {
  /** Truyền từ page đã có data (vd. profile) để tránh fetch trùng */
  profile?: CandidateProfile | null;
  displayName?: string;
  avatarUrl?: string | null;
};

/**
 * Sidebar ứng viên dùng chung: profile, resume, applications, saved-jobs, ...
 * Không truyền `profile` → tự gọi GET /candidates/me + GET /users/me.
 */
export function ConnectedCandidateSidebar({
  profile: profileProp,
  displayName: displayNameProp,
  avatarUrl: avatarUrlProp,
}: ConnectedCandidateSidebarProps = {}) {
  const shouldFetch = profileProp === undefined;
  const { profile, account, loading } = useCandidateSidebarData(shouldFetch);

  if (shouldFetch && loading) {
    return (
      <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[280px]">
        <div className="skeleton h-64 rounded-xl" />
        <div className="skeleton h-80 rounded-xl" />
      </aside>
    );
  }

  return (
    <CandidateSidebar
      profile={profileProp ?? profile}
      displayName={displayNameProp ?? account?.fullName ?? "Ứng viên"}
      avatarUrl={avatarUrlProp ?? account?.avatar}
    />
  );
}
