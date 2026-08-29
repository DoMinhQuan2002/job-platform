import { DashboardStats } from "@/modules/recruiter/components/dashboard-stats";
import { CandidateStatusChart, CandidateTrendChart } from "@/modules/recruiter/components/dashboard-charts";
import { RecentActivity, RecentJobs } from "@/modules/recruiter/components/dashboard-lists";
import { DashboardWelcome } from "@/modules/recruiter/components/dashboard-welcome";

export default function RecruiterPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section>
        <DashboardWelcome />
      </section>

      <section>
        <DashboardStats />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <CandidateTrendChart />
        <CandidateStatusChart />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <RecentJobs />
        <RecentActivity />
      </section>
    </div>
  );
}
