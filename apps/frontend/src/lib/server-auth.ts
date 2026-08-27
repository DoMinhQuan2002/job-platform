import { cookies } from "next/headers";

type AuthRole = "CANDIDATE" | "RECRUITER" | "ADMIN";

export type ServerSession = {
  userId: string;
  email: string;
  role: AuthRole;
  expiresAt: number;
};

type AccessTokenPayload = {
  sub?: string | number;
  email?: string;
  role?: AuthRole;
  exp?: number;
};

const ACCESS_TOKEN_COOKIE = "jp_access_token";
const validRoles = new Set<AuthRole>(["CANDIDATE", "RECRUITER", "ADMIN"]);

const decodePayload = (token: string): AccessTokenPayload | null => {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;

    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as AccessTokenPayload;
  } catch {
    return null;
  }
};

export async function getServerSession(): Promise<ServerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;

  const payload = decodePayload(token);
  if (
    !payload?.sub ||
    !payload.email ||
    !payload.role ||
    !validRoles.has(payload.role) ||
    !payload.exp ||
    payload.exp * 1000 <= Date.now()
  ) {
    return null;
  }

  const apiOrigin = (
    process.env.INTERNAL_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:4000"
  ).replace(/\/$/, "");

  try {
    const response = await fetch(`${apiOrigin}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;

    const body = (await response.json()) as {
      data?: { id?: string | number; email?: string; role?: AuthRole };
    };
    const user = body.data;
    if (
      !user?.id ||
      !user.email ||
      !user.role ||
      !validRoles.has(user.role) ||
      user.role !== payload.role
    ) {
      return null;
    }

    return {
      userId: String(user.id),
      email: user.email,
      role: user.role,
      expiresAt: payload.exp * 1000,
    };
  } catch {
    return null;
  }
}
