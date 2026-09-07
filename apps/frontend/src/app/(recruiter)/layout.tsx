import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { SessionGuard } from "@/components/auth/session-guard";
import { getSessionState } from "@/lib/server-auth";
import { RecruiterShell } from "@/modules/recruiter/components/recruiter-shell";

export default async function RecruiterLayout({ children }: { children: ReactNode }) {
  const state = await getSessionState();

  // Không có token nào -> chắc chắn chưa đăng nhập.
  if (state.status === "none") {
    redirect(ROUTES.auth.login);
  }

  // Token còn hạn -> chặn ngay trên server như cũ, không tốn thêm bước nào.
  if (state.status === "valid") {
    if (state.session.role !== "RECRUITER") {
      redirect(state.session.role === "CANDIDATE" ? ROUTES.candidate.root : ROUTES.home);
    }

    return <RecruiterShell>{children}</RecruiterShell>;
  }

  // status === "expired": còn cookie nhưng access token quá 15 phút.
  // Trước đây chỗ này đá thẳng ra login. Giờ cho client thử refresh trước.
  return (
    <SessionGuard role="RECRUITER">
      <RecruiterShell>{children}</RecruiterShell>
    </SessionGuard>
  );
}
