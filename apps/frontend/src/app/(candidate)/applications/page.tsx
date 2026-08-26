import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Legacy `/applications` → `/candidate/applications` */
export default function Page() {
  redirect(ROUTES.applications.root);
}
