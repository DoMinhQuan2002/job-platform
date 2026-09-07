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

/**
 * Local: FE localhost:3000 va BE localhost:4000 cung mot "site" -> Strict van chay.
 * Production ma FE/BE khac domain (vd. Vercel + Render) thi trinh duyet coi la
 * cross-site: Strict chan cookie refresh_token => moi user bi logout sau 15 phut.
 * Truong hop do phai dat COOKIE_SAMESITE=none va COOKIE_SECURE=true.
 */
const resolveSameSite = (): "strict" | "lax" | "none" => {
  const value = process.env.COOKIE_SAMESITE?.trim().toLowerCase();

  if (!value) {
    return "strict";
  }

  // Go sai chinh ta (vd "nono") -> bao loi ngay. Neu am tham roi ve "strict" thi
  // tren production cookie bi chan, user logout sau 15 phut ma khong ai biet tai sao.
  if (value !== "none" && value !== "lax" && value !== "strict") {
    throw new Error(
      `COOKIE_SAMESITE khong hop le: "${value}". Chi nhan strict | lax | none.`,
    );
  }

  return value;
};

const baseOptions = (): CookieOptions => {
  const secure = isSecure();
  const sameSite = resolveSameSite();

  // SameSite=None bat buoc di kem Secure, khong thi trinh duyet vut cookie im lang.
  if (sameSite === "none" && !secure) {
    throw new Error(
      "COOKIE_SAMESITE=none yeu cau COOKIE_SECURE=true (chi hoat dong tren https).",
    );
  }

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: COOKIE_PATH,
  };
};

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
