const ACCESS_TOKEN_KEY = "jp_access_token";
const USER_KEY = "jp_user";

export type StoredUser = { email: string; fullName: string };

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string | null) => {
  if (typeof window === "undefined") {
    return;
  }
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.dispatchEvent(new Event("jp-auth-change"));
};

export const getStoredUser = (): StoredUser | null => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(USER_KEY) || "null") as StoredUser | null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: StoredUser | null) => {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("jp-auth-change"));
};

export const clearAccessToken = () => {
  setAccessToken(null);
  setStoredUser(null);
};
