const ACCESS_TOKEN_KEY = "jp_access_token";

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
};

export const clearAccessToken = () => setAccessToken(null);
