import { NextResponse } from "next/server";

/**
 * Next.js Proxy (Middleware)
 * Bảo vệ route chính được xử lý bởi Client-side Auth Guard trong AdminShell kết hợp
 * cơ chế lưu Access Token trong JS memory và tự động refresh qua HttpOnly cookie.
 */
export function proxy() {
  const response = NextResponse.next();

  // Thêm các header bảo mật cơ bản
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/auth/login"],
};
