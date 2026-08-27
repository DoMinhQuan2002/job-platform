import { BriefcaseBusiness, FileText, Users } from "lucide-react";
import { DashboardCard } from "@/modules/recruiter/components/dashboard-card";
import { CandidateStatusChart, CandidateTrendChart } from "@/modules/recruiter/components/dashboard-charts";
import { RecentActivity, RecentJobs } from "@/modules/recruiter/components/dashboard-lists";

export default function RecruiterPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section>
        <div><h1 className="text-xl font-bold">Chào mừng trở lại, Công ty TNHH ABC! 👋</h1><p className="mt-1 text-xs text-muted">Dưới đây là tổng quan hoạt động tuyển dụng của bạn hôm nay.</p></div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardCard label="Tin đăng đang tuyển" value={12} detail="2 tin so với kỳ trước" icon={BriefcaseBusiness} />
        <DashboardCard label="Ứng viên mới" value={48} detail="15 ứng viên so với kỳ trước" icon={FileText} tone="success" />
        <DashboardCard label="Tổng ứng viên" value={156} detail="28 ứng viên so với kỳ trước" icon={Users} tone="purple" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3"><CandidateTrendChart /><CandidateStatusChart /></section>
      <section className="grid gap-5 lg:grid-cols-2"><RecentJobs /><RecentActivity /></section>
    </div>
  );
}
