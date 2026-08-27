import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Alias `/candidate/saved-jobs` → `/candidate/applications/saved-jobs` */
export default function Page() {
  redirect(ROUTES.applications.savedJobs);
}
