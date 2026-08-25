import Link from "next/link";
import { PageSection } from "@/components/layout/page-section";
import { ROUTES } from "@/constants/routes";

export default function HomePage() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6">
      <PageSection
        title="Job Platform — Frontend base"
        description="Scaffold sẵn route groups + HTTP client + service G3. Group 3 làm UI trên /candidate; admin ở app riêng port 3001."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Link href={ROUTES.candidate.root} className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
          Candidate (G3)
        </Link>
        <Link href={ROUTES.recruiter.root} className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
          Recruiter (G2)
        </Link>
        <Link href={ROUTES.login} className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
          Auth (G1)
        </Link>
      </div>
    </main>
  );
}
