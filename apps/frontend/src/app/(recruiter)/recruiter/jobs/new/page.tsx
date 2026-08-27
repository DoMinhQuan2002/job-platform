import type { Metadata } from "next";
import { RecruiterJobForm } from "@/modules/recruiter/components/job-form/recruiter-job-form";

export const metadata: Metadata = { title: "Đăng tin tuyển dụng - JobPlatform" };

export default function CreateRecruiterJobPage() {
  return <RecruiterJobForm mode="create" />;
}
