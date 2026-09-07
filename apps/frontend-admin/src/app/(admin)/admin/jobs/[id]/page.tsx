import type { Metadata } from "next";
import { AdminJobDetailView } from "@/components/jobs/admin-job-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Chi tiết tin tuyển dụng #${id} - JOB PLATFORM Admin`,
    description:
      "Xem chi tiết tin tuyển dụng, phê duyệt, từ chối và quản lý trạng thái bài đăng.",
  };
}

export default async function AdminJobDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminJobDetailView jobId={id} />;
}
