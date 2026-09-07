import type { Metadata } from "next";
import { AdminNotificationsView } from "@/components/notifications/admin-notifications-view";

export const metadata: Metadata = {
  title: "Thông báo - JOB PLATFORM Quản trị",
  description: "Xem và theo dõi tất cả thông báo trong hệ thống",
};

export default function AdminNotificationsPage() {
  return <AdminNotificationsView />;
}
