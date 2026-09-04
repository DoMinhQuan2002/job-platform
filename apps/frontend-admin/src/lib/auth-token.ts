/**
 * Quản lý Access Token trong Memory (Biến JavaScript Module)
 * Tuyệt đối không lưu accessToken vào localStorage, sessionStorage hay document.cookie.
 */

let inMemoryAccessToken: string | null = null;

const LEGACY_TOKEN_COOKIE_NAMES = [
  "jp_access_token",
  "accessToken",
  "access_token",
  "token",
  "admin_access_token",
  "admin_token",
  "jwt",
  "auth_token",
];

export const getAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

export const setAccessToken = (token: string | null): void => {
  if (!token) {
    inMemoryAccessToken = null;
    return;
  }

  let cleaned = token.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.toLowerCase().startsWith("bearer ")) {
    cleaned = cleaned.slice(7).trim();
  }
  inMemoryAccessToken = cleaned;
};

export const clearAccessToken = (): void => {
  inMemoryAccessToken = null;

  // Dọn dẹp triệt để các storage/cookie cũ nếu còn sót từ các phiên bản trước
  if (typeof document !== "undefined") {
    for (const name of LEGACY_TOKEN_COOKIE_NAMES) {
      document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Strict`;
      document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0`;
    }
  }

  if (typeof window !== "undefined") {
    for (const key of LEGACY_TOKEN_COOKIE_NAMES) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
    localStorage.removeItem("admin_user");
    sessionStorage.removeItem("admin_user");
  }
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
  // Buffer 5 giây phòng ngừa độ trễ mạng
  return payload.exp * 1000 <= Date.now() + 5000;
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
