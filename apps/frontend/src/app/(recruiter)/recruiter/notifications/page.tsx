import type { Metadata } from "next";
import { RecruiterNotificationsPage } from "@/modules/recruiter/components/notifications/recruiter-notifications-page";

export const metadata: Metadata = {
  title: "Thông báo tuyển dụng | JobPlatform",
  description: "Trung tâm thông báo dành cho nhà tuyển dụng.",
};

export default function Page() {
  return <RecruiterNotificationsPage />;
}
