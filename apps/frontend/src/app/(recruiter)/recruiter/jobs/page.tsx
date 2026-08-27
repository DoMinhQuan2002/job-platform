import type { Metadata } from "next";
import { RecruiterJobsPage } from "@/modules/recruiter/components/jobs/recruiter-jobs-page";

export const metadata: Metadata = {
  title: "Quản lý tin tuyển dụng - JobPlatform",
};

export default function RecruiterJobsRoute() {
  return <RecruiterJobsPage />;
}
