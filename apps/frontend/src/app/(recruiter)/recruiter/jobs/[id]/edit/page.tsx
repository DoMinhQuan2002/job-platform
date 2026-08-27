import type { Metadata } from "next";
import { RecruiterJobForm } from "@/modules/recruiter/components/job-form/recruiter-job-form";

export const metadata: Metadata = { title: "Chỉnh sửa tin tuyển dụng - JobPlatform" };

export default async function EditRecruiterJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RecruiterJobForm mode="edit" jobId={id} />;
}
