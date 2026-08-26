import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Legacy `/applications/saved-jobs` → canonical */
export default function Page() {
  redirect(ROUTES.applications.savedJobs);
}
