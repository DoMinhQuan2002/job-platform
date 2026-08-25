import jwt from "jsonwebtoken";
import type { RoleValue } from "../constants/roles";

export const ACCESS_TOKEN_TTL_SECONDS = 900; // 15 phut

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: RoleValue;
};

const getSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret || secret.trim().length === 0) {
    throw new Error("Missing JWT_ACCESS_SECRET. Set it in apps/backend/.env");
  }

  return secret;
};

export const signAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, getSecret(), { expiresIn: ACCESS_TOKEN_TTL_SECONDS });

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, getSecret());

  if (typeof decoded === "string" || !decoded.sub) {
    throw new Error("Invalid access token payload");
  }

  return {
    sub: String(decoded.sub),
    email: String((decoded as jwt.JwtPayload).email ?? ""),
    role: (decoded as jwt.JwtPayload).role as RoleValue,
  };
};
