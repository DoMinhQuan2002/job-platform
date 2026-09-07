const ACCESS_TOKEN_COOKIE = "jp_admin_access_token";
const USER_COOKIE = "jp_admin_user";
const AUTH_PERSISTENCE_COOKIE = "jp_admin_remember_auth";
const REMEMBER_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const CANDIDATE_COOKIE_NAMES = [
  ACCESS_TOKEN_COOKIE,
  "jp_access_token",
  "accessToken",
  "access_token",
  "token",
  "admin_access_token",
  "admin_token",
];

export type AuthRole = "ADMIN";

export type StoredUser = {
  id?: number | string;
  email: string;
  fullName: string;
  role?: string;
  avatar?: string | null;
};

const notifyAuthChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("jp-admin-auth-change"));
  }
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const prefix = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(prefix));

  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(prefix.length));
  } catch {
    return null;
  }
};

const setCookie = (name: string, value: string, maxAgeSeconds?: number) => {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const maxAge = maxAgeSeconds ? `; Max-Age=${maxAgeSeconds}` : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${maxAge}${secure}`;
};

const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0`;
};

export interface JwtPayload {
  sub?: string | number;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

export const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 <= Date.now() + 5000;
};

export const getAccessToken = (): string | null => {
  for (const name of CANDIDATE_COOKIE_NAMES) {
    const val = getCookie(name);
    if (val) {
      let cleaned = val.trim();
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1);
      }
      if (cleaned.toLowerCase().startsWith("bearer ")) {
        cleaned = cleaned.slice(7).trim();
      }
      if (cleaned) return cleaned;
    }
  }
  return null;
};

export const getAccessTokenRole = (): string | null => {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
  return payload.role ?? null;
};

const getAuthCookieMaxAge = () =>
  getCookie(AUTH_PERSISTENCE_COOKIE) === "true"
    ? REMEMBER_MAX_AGE_SECONDS
    : undefined;

export const setAuthPersistence = (remember: boolean) => {
  if (remember) {
    setCookie(AUTH_PERSISTENCE_COOKIE, "true", REMEMBER_MAX_AGE_SECONDS);
    return;
  }
  deleteCookie(AUTH_PERSISTENCE_COOKIE);
};

export const setAccessToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (!token) {
    for (const name of CANDIDATE_COOKIE_NAMES) {
      deleteCookie(name);
    }
    notifyAuthChange();
    return;
  }

  let cleaned = token.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.toLowerCase().startsWith("bearer ")) {
    cleaned = cleaned.slice(7).trim();
  }

  setCookie(ACCESS_TOKEN_COOKIE, cleaned, getAuthCookieMaxAge());
  notifyAuthChange();
};

export const getStoredUser = (): StoredUser | null => {
  try {
    return JSON.parse(getCookie(USER_COOKIE) || "null") as StoredUser | null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: StoredUser | null) => {
  if (typeof window === "undefined") return;
  if (user) setCookie(USER_COOKIE, JSON.stringify(user), getAuthCookieMaxAge());
  else deleteCookie(USER_COOKIE);
  notifyAuthChange();
};

export const clearAccessToken = () => {
  setAccessToken(null);
  setStoredUser(null);
  setAuthPersistence(false);
  if (typeof window !== "undefined") {
    for (const key of CANDIDATE_COOKIE_NAMES) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
    localStorage.removeItem("admin_user");
    sessionStorage.removeItem("admin_user");
  }
};

export const logoutAndRedirectToLogin = (reason = "session_expired"): void => {
  clearAccessToken();
  if (typeof window !== "undefined") {
    if (!window.location.pathname.startsWith("/auth/login")) {
      const target = `/auth/login?reason=${encodeURIComponent(reason)}`;
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = target;
    }
  }
};
