import { NextResponse, type NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE = "jp_admin_access_token";

const readValidAdminRole = (token: string): boolean => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload) as { exp?: number; role?: string };
    if (!payload.exp || payload.exp * 1000 <= Date.now()) return false;
    return payload.role === "ADMIN";
  } catch {
    return false;
  }
};

/**
 * Next.js 16 Proxy
 * Bảo vệ route:
 * - Chuyển hướng người dùng đã có token Admin hợp lệ ra khỏi trang đăng nhập (/auth/login).
 * - Gắn các header bảo mật cơ bản cho toàn bộ ứng dụng.
 * - Các route /admin/* được bảo vệ kết hợp giữa Proxy và Client-side Auth Guard trong AdminShell
 *   để hỗ trợ cơ chế làm mới access token tự động qua HttpOnly cookie.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ||
    request.cookies.get("jp_access_token")?.value;

  const hasValidAdminToken = token ? readValidAdminRole(token) : false;

  // 1. Đang ở trang login nhưng đã có token Admin hợp lệ -> Chuyển hướng vào Dashboard
  if (pathname.startsWith("/auth/login")) {
    if (hasValidAdminToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 2. Thiết lập header bảo mật
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/auth/login"],
};
