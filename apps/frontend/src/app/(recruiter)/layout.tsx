import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { getServerSession } from "@/lib/server-auth";
import { RecruiterShell } from "@/modules/recruiter/components/recruiter-shell";

export default async function RecruiterLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect(ROUTES.auth.login);
  }

  if (session.role !== "RECRUITER") {
    redirect(session.role === "CANDIDATE" ? ROUTES.candidate.root : ROUTES.home);
  }

  return <RecruiterShell>{children}</RecruiterShell>;
}
