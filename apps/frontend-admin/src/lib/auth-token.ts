const ACCESS_TOKEN_COOKIE = "jp_admin_access_token";
const USER_COOKIE = "jp_admin_user";
const AUTH_PERSISTENCE_COOKIE = "jp_admin_remember_auth";
const REMEMBER_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export type AuthRole = "ADMIN";

export type StoredUser = {
  id?: number;
  email: string;
  fullName: string;
  role?: string;
};

const notifyAuthChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("jp-admin-auth-change"));
  }
};

const getCookie = (name: string) => {
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
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; SameSite=Strict${maxAge}${secure}`;
};

const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Strict${secure}`;
};

export const getAccessToken = (): string | null => {
  return getCookie(ACCESS_TOKEN_COOKIE);
};

export const getAccessTokenRole = (): string | null => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const encoded = token.split(".")[1];
    if (!encoded) return null;
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as { role?: string; exp?: number };
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
    return payload.role ?? null;
  } catch {
    return null;
  }
};

const getAuthCookieMaxAge = () =>
  getCookie(AUTH_PERSISTENCE_COOKIE) === "true"
    ? REMEMBER_MAX_AGE_SECONDS
    : undefined;

export const setAuthPersistence = (remember: boolean) => {
  if (remember) {
    setCookie(
      AUTH_PERSISTENCE_COOKIE,
      "true",
      REMEMBER_MAX_AGE_SECONDS,
    );
    return;
  }
  deleteCookie(AUTH_PERSISTENCE_COOKIE);
};

export const setAccessToken = (token: string | null) => {
  if (typeof window === "undefined") {
    return;
  }
  if (!token) {
    deleteCookie(ACCESS_TOKEN_COOKIE);
    notifyAuthChange();
    return;
  }
  setCookie(ACCESS_TOKEN_COOKIE, token, getAuthCookieMaxAge());
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
};
