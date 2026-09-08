import type { Metadata } from "next";
import { Suspense } from "react";
import { RecruiterCandidatesPage } from "@/modules/recruiter/components/candidates/recruiter-candidates-page";

export const metadata: Metadata = {
  title: "Quản lý ứng viên - JobPlatform",
};

export default function RecruiterCandidatesRoute() {
  return (
    <Suspense fallback={null}>
      <RecruiterCandidatesPage />
    </Suspense>
  );
}
