import Link from "next/link";
import { PageSection } from "@/components/layout/page-section";

export default function HomePage() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6">
      <PageSection
        title="Base frontend is ready"
        description="The project is split into public/candidate/recruiter/admin routes, with Tailwind + shadcn so the team can work fast."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/candidate" className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
          Candidate area
        </Link>
        <Link href="/recruiter" className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
          Recruiter area
        </Link>
        <Link href="/admin" className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
          Admin area
        </Link>
      </div>
    </main>
  );
}
