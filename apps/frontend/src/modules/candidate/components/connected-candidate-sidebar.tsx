"use client";

import { useEffect, useState } from "react";
import { candidateApi } from "../api";
import type { AccountUser, CandidateProfile } from "../types";
import { CandidateSidebar } from "./candidate-sidebar";

/** Sidebar + GET /candidates/me + GET /users/me — dùng chung profile / resume / applications */
export function ConnectedCandidateSidebar({
  displayName = "Ứng viên",
}: {
  displayName?: string;
}) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [account, setAccount] = useState<AccountUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      candidateApi.getMe().catch(() => null),
      candidateApi.getAccountMe().catch(() => null),
    ]).then(([profileRes, accountRes]) => {
      if (cancelled) return;
      if (profileRes?.success && profileRes.data) setProfile(profileRes.data);
      if (accountRes?.success && accountRes.data) setAccount(accountRes.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CandidateSidebar
      profile={profile}
      displayName={account?.fullName || displayName}
      avatarUrl={account?.avatar}
    />
  );
}
