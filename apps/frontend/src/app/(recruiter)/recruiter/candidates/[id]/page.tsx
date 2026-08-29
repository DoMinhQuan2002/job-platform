import type { Metadata } from "next";
import { RecruiterCandidateDetailPage } from "@/modules/recruiter/components/candidates/recruiter-candidate-detail-page";

export const metadata: Metadata = {
  title: "Thông tin ứng viên - JobPlatform",
};

export default async function RecruiterCandidateDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RecruiterCandidateDetailPage id={id} />;
}
