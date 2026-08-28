"use client";

import { useEffect, useState } from "react";
import { candidateApi } from "../api";
import type { AccountUser, CandidateProfile } from "../types";

type UseCandidateSidebarDataResult = {
  profile: CandidateProfile | null;
  account: AccountUser | null;
  loading: boolean;
};

export function useCandidateSidebarData(
  enabled = true,
): UseCandidateSidebarDataResult {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void Promise.all([
      candidateApi.getMe().catch(() => null),
      candidateApi.getAccountMe().catch(() => null),
    ]).then(([profileRes, accountRes]) => {
      if (cancelled) return;
      if (profileRes?.success && profileRes.data) setProfile(profileRes.data);
      if (accountRes?.success && accountRes.data) setAccount(accountRes.data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { profile, account, loading };
}
