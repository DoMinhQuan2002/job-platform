import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** `/candidate` là hub nội bộ lúc chia module — production đưa thẳng vào hồ sơ. */
export default function CandidateHubPage() {
  redirect(ROUTES.candidate.profile);
}
