import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Legacy `/applications/:id` → `/candidate/applications/:id` */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`${ROUTES.applications.root}/${id}`);
}
