import type { Metadata } from "next";
import { RecruiterNotificationDetailPage } from "@/modules/recruiter/components/notifications/recruiter-notification-detail-page";

export const metadata: Metadata = {
  title: "Chi tiết thông báo tuyển dụng | JobPlatform",
  description: "Chi tiết thông báo dành cho nhà tuyển dụng.",
};

export default function Page() {
  return <RecruiterNotificationDetailPage />;
}
