import type { CookieOptions, Request, Response } from "express";
import {
  COOKIE_PATH,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
} from "./auth.constants";

/**
 * Refresh token di qua httpOnly cookie (web-only), khong bao gio nam trong JSON body.
 * COOKIE_SECURE=false chi dung khi chay local qua http; production luon de Secure.
 */
const isSecure = () =>
  process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : process.env.NODE_ENV === "production";

const getSameSite = (): "strict" | "lax" | "none" => {
  const envVal = (process.env.COOKIE_SAME_SITE || "").toLowerCase();
  if (envVal === "lax" || envVal === "none" || envVal === "strict") {
    return envVal;
  }
  return "strict";
};

const baseOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isSecure(),
  sameSite: getSameSite(),
  path: COOKIE_PATH,
});

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseOptions(),
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.cookie(REFRESH_TOKEN_COOKIE, "", { ...baseOptions(), maxAge: 0 });
};

export const readRefreshTokenCookie = (req: Request): string | undefined => {
  const value = req.cookies?.[REFRESH_TOKEN_COOKIE];
  return typeof value === "string" && value.length > 0 ? value : undefined;
};
