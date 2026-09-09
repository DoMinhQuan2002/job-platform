import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { SessionGuard } from "@/components/auth/session-guard";
import { getSessionState } from "@/lib/server-auth";

export default async function CandidateLayout({ children }: { children: ReactNode }) {
  const state = await getSessionState();

  // Không có token nào -> chuyển sang đăng nhập.
  if (state.status === "none") {
    redirect(ROUTES.auth.login);
  }

  // Token còn hạn -> kiểm tra role ngay trên server.
  if (state.status === "valid") {
    if (state.session.role === "RECRUITER") {
      redirect(ROUTES.recruiter.root);
    }
    if (state.session.role !== "CANDIDATE") {
      redirect(ROUTES.home);
    }

    return <>{children}</>;
  }

  // status === "expired": còn cookie nhưng access token quá hạn -> client thử refresh trước.
  return (
    <SessionGuard role="CANDIDATE">
      {children}
    </SessionGuard>
  );
}
