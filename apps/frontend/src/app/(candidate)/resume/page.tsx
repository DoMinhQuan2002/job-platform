import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Legacy `/resume` → `/candidate/resume` */
export default function Page() {
  redirect(ROUTES.resume.root);
}
