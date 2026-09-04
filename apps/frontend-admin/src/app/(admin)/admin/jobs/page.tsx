import type { Metadata } from "next";
import { AdminJobsView } from "@/components/jobs/admin-jobs-view";

export const metadata: Metadata = {
  title: "Quản lý tin tuyển dụng - JOB PLATFORM Admin",
  description: "Kiểm duyệt, phê duyệt, từ chối và quản lý danh sách tin tuyển dụng trên hệ thống",
};

export default function AdminJobsPage() {
  return <AdminJobsView />;
}

