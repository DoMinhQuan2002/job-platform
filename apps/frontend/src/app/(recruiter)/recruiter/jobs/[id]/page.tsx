import type { Metadata } from "next";
import { RecruiterJobDetailPage } from "@/modules/recruiter/components/job-detail/recruiter-job-detail-page";

export const metadata: Metadata = {
  title: "Chi tiết tin tuyển dụng - JobPlatform",
};

export default async function RecruiterJobDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RecruiterJobDetailPage id={id} />;
}
