"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { getAccessToken, getAccessTokenRole, type AuthRole } from "@/lib/auth-token";
import { refreshAccessToken, scheduleTokenRefresh } from "@/lib/token-refresh";

type SessionGuardProps = {
  /** Bỏ trống = chỉ cần đăng nhập, không quan tâm role. */
  role?: AuthRole;
  children: ReactNode;
};

type GuardState = "checking" | "allowed" | "denied";

/**
 * Dùng cho khu vực chỉ server component mới chặn được (vd. layout recruiter).
 * Server không tự refresh được vì cookie refresh_token nằm ở domain của BE,
 * nên phần "cứu" token phải chạy ở trình duyệt.
 */
export function SessionGuard({ role, children }: SessionGuardProps) {
  const router = useRouter();
  const [state, setState] = useState<GuardState>("checking");

  useEffect(() => {
    let active = true;

    const run = async () => {
      // getAccessTokenRole() trả null khi token thiếu HOẶC đã hết hạn.
      let currentRole = getAccessTokenRole();

      if (!currentRole && getAccessToken()) {
        // Còn cookie nhưng hết hạn -> thử refresh trước khi kết luận.
        const token = await refreshAccessToken();

        if (token) {
          scheduleTokenRefresh();
          currentRole = getAccessTokenRole();
        }
      }

      if (!active) return;

      const allowed = Boolean(currentRole) && (!role || currentRole === role);
      setState(allowed ? "allowed" : "denied");

      if (!allowed) {
        router.replace(ROUTES.auth.login);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [role, router]);

  if (state !== "allowed") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Đang xác thực tài khoản...</p>
      </div>
    );
  }

  return <>{children}</>;
}
