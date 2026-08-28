"use client";

import { useCallback, useEffect, useState } from "react";
import { getAccessToken, getStoredUser, type StoredUser } from "@/lib/auth-token";

export type AuthRole = "CANDIDATE" | "RECRUITER" | "ADMIN";

export type AuthSession = StoredUser & { role: AuthRole };

function readSession(): AuthSession | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const encodedPayload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(encodedPayload)) as {
      email?: string;
      role?: AuthRole;
      exp?: number;
    };

    if (!payload.role || (payload.exp && payload.exp * 1000 <= Date.now())) {
      return null;
    }

    const stored = getStoredUser();
    return {
      email: stored?.email || payload.email || "",
      fullName: stored?.fullName || payload.email?.split("@")[0] || "Tài khoản",
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());

  const refresh = useCallback(() => {
    setSession(readSession());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("jp-auth-change", refresh);
    return () => window.removeEventListener("jp-auth-change", refresh);
  }, [refresh]);

  return {
    session,
    isCandidate: session?.role === "CANDIDATE",
    isRecruiter: session?.role === "RECRUITER",
    isLoggedIn: Boolean(session),
  };
}
