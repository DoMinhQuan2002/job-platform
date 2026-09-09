import { NextResponse, type NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE = "jp_access_token";

type AuthRole = "CANDIDATE" | "RECRUITER" | "ADMIN";

type AccessTokenPayload = {
  role?: AuthRole;
  exp?: number;
};

const authenticatedDestination = (role: AuthRole) => {
  if (role === "CANDIDATE") return "/candidate/profile";
  if (role === "RECRUITER") return "/recruiter";
  return "/";
};

const readValidRole = (token: string): AuthRole | null => {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return null;

    const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as AccessTokenPayload;

    if (!payload.exp || payload.exp * 1000 <= Date.now()) return null;
    if (
      payload.role !== "CANDIDATE" &&
      payload.role !== "RECRUITER"
    ) {
      return null;
    }

    return payload.role;
  } catch {
    return null;
  }
};

export function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const role = token ? readValidRole(token) : null;
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/auth")) {
    if (role) {
      return NextResponse.redirect(
        new URL(authenticatedDestination(role), request.url),
      );
    }
    return NextResponse.next();
  }

  const isCandidatePath =
    pathname.startsWith("/candidate") ||
    pathname.startsWith("/applications") ||
    pathname.startsWith("/resume");

  if (isCandidatePath && role === "RECRUITER") {
    return NextResponse.redirect(new URL("/recruiter", request.url));
  }

  if (pathname.startsWith("/recruiter") && role === "CANDIDATE") {
    return NextResponse.redirect(new URL("/candidate/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/candidate/:path*",
    "/applications/:path*",
    "/resume/:path*",
    "/recruiter/:path*",
  ],
};
