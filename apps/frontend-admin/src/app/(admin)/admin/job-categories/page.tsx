import { Metadata } from "next";
import { AdminJobCategoriesView } from "@/components/job-categories/admin-job-categories-view";

export const metadata: Metadata = {
  title: "Quản lý ngành nghề - Job Platform",
  description: "Quản lý danh sách các ngành nghề trên hệ thống",
};

export default function AdminJobCategoriesPage() {
  return <AdminJobCategoriesView />;
}
