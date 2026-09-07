import { Metadata } from "next";
import { AdminSystemLogsView } from "@/components/system-logs/admin-system-logs-view";

export const metadata: Metadata = {
  title: "Nhật ký hệ thống - Job Platform",
  description: "Xem log các hoạt động quan trọng được ghi nhận trong hệ thống.",
};

export default function AdminSystemLogsPage() {
  return <AdminSystemLogsView />;
}
