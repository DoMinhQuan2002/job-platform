"use client";

import { useSyncExternalStore } from "react";
import { getAccessToken, getStoredUser, type StoredUser, type AuthRole } from "@/lib/auth-token";

export type AuthSession = StoredUser & { role: AuthRole };

/** Re-export để app-chrome và các component khác import từ một chỗ. */
export type { AuthRole };

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

/**
 * getSnapshot bị gọi rất nhiều lần mỗi render. readSession() tạo object mới
 * mỗi lần gọi -> React so sánh bằng Object.is sẽ luôn thấy "khác" và render vô tận.
 * Nên phải cache, và chỉ tính lại khi có event "jp-auth-change".
 */
let cachedSession: AuthSession | null = null;
let hasRead = false;

const readIntoCache = () => {
  cachedSession = readSession();
  hasRead = true;
};

const subscribeAuthChange = (onStoreChange: () => void) => {
  const handler = () => {
    readIntoCache();
    onStoreChange();
  };
  window.addEventListener("jp-auth-change", handler);
  return () => window.removeEventListener("jp-auth-change", handler);
};

const getSessionSnapshot = (): AuthSession | null => {
  if (!hasRead) readIntoCache();
  return cachedSession;
};

/** Server không có cookie -> luôn "chưa đăng nhập", tránh hydration mismatch. */
const getServerSnapshot = (): AuthSession | null => null;


export function useAuthSession() {
  const session = useSyncExternalStore(
    subscribeAuthChange,
    getSessionSnapshot,
    getServerSnapshot,
  );

  return {
    session,
    isCandidate: session?.role === "CANDIDATE",
    isRecruiter: session?.role === "RECRUITER",
    isLoggedIn: Boolean(session),
  };
}
