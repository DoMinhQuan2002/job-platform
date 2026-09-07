const ACCESS_TOKEN_COOKIE = "jp_access_token";
const USER_COOKIE = "jp_user";
const AUTH_PERSISTENCE_COOKIE = "jp_remember_auth";
const REMEMBER_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export type AuthRole = "CANDIDATE" | "RECRUITER" | "ADMIN";

export type StoredUser = {
  id?: number;
  email: string;
  fullName: string;
  role?: string;
  avatar?: string | null;
};

type AccessTokenPayload = {
  role?: string;
  exp?: number;
}

const notifyAuthChange = () => {
  window.dispatchEvent(new Event("jp-auth-change"));
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

/**
 * SameSite=Lax (KHÔNG phải Strict).
 * Với Strict, khi user mở web từ link ngoài (email, Google, Zalo...) trình duyệt
 * không gửi cookie trong lần điều hướng đầu tiên -> server Next đọc ra "chưa đăng nhập"
 * và đá về trang login. Lax vẫn chặn CSRF cho POST nhưng cho phép mở link bình thường.
 */
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
};

export const getAccessToken = (): string | null => {
  return getCookie(ACCESS_TOKEN_COOKIE);
};

/** Đọc phần payload của JWT. Không xác minh chữ ký — chỉ để hiển thị UI. */
const decodeTokenPayload = (token: string): AccessTokenPayload | null => {
  try {
    const encoded = token.split(".")[1];
    if (!encoded) return null;
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

    // atob gives one char per byte; convert those bytes back to UTF-8 text
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);

    const payload = JSON.parse(json) as AccessTokenPayload;

    // JSON.parse can return a string, number, or null — make sure it is an object
    if (typeof payload !== "object" || payload === null) return null;
    return payload;
  } catch {
    return null;
  }
};

/** Thời điểm access token hết hạn (ms epoch). null = không có token. */
export const getAccessTokenExpiry = (): number | null => {
  const token = getAccessToken();
  if (!token) return null;

  const payload = decodeTokenPayload(token);
  return payload?.exp ? payload.exp * 1000 : null;
};

/** true = còn cookie nhưng đã quá hạn -> vẫn có thể cứu bằng refresh. */
export const isAccessTokenExpired = (): boolean => {
  const expiresAt = getAccessTokenExpiry();
  return expiresAt !== null && expiresAt <= Date.now();
}

export const getAccessTokenRole = (): AuthRole | null => {
  const token = getAccessToken();
  if (!token) return null;

  const payload = decodeTokenPayload(token);
  if (!payload) return null;
  if (payload.exp && payload.exp * 1000 <= Date.now()) return null;

  return payload.role === "CANDIDATE" || payload.role === "RECRUITER" || payload.role === "ADMIN"
    ? payload.role
    : null;
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
