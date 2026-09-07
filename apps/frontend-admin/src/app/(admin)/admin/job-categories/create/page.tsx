import { Metadata } from "next";
import { JobCategoryForm } from "@/components/job-categories/job-category-form";

export const metadata: Metadata = {
  title: "Thêm ngành nghề - Job Platform",
  description: "Tạo mới ngành nghề trong hệ thống",
};

export default function CreateJobCategoryPage() {
  return <JobCategoryForm mode="create" />;
}
