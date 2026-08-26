"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, ChevronRight, Home, Loader2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { JobDetail } from "../types";
import { JobHeaderCard } from "../components/job-header-card";
import { JobContentSections } from "../components/job-content-sections";
import { JobSidebar } from "../components/job-sidebar";
import { JobNewsletter } from "../components/job-newsletter";
import { ApplyModal } from "../components/apply-modal";
import { applicationsApi } from "../api";
import { summarizeJob } from "../lib/job-summary";

function toJobDetail(jobId: string, raw: unknown): JobDetail {
  const summary = summarizeJob(raw);
  return {
    id: jobId,
    title: summary.title,
    company: {
      name: summary.companyName,
      logoUrl: summary.companyLogoUrl || "",
      verified: true,
      industry: summary.category,
      size: summary.companySize,
      website: summary.companyWebsite,
      address: summary.companyAddress || summary.location,
      about: summary.companyAbout || summary.description.join(" "),
    },
    salary: summary.salary,
    location: summary.location,
    jobType: summary.jobType,
    workplaceType: summary.workplaceType,
    experience: summary.experience,
    quantity: summary.quantity,
    deadline: summary.deadline,
    summary:
      summary.description[0] ||
      summary.companyAbout ||
      "Chi tiết công việc được cập nhật từ tin tuyển dụng.",
    tags: summary.tags.length ? summary.tags : [summary.category],
    description: summary.description.length
      ? summary.description
      : ["Chưa có mô tả chi tiết."],
    requirements: summary.requirements.length
      ? summary.requirements
      : ["Chưa có yêu cầu chi tiết."],
    benefits: summary.benefits.length ? summary.benefits : ["Thỏa thuận khi phỏng vấn."],
    skills: {
      required: summary.tags,
      optional: [],
    },
    isSaved: false,
  };
}

export function JobApplyPage() {
  const params = useParams();
  const jobId = String(params?.id ?? "");

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      setError("Thiếu mã tin tuyển dụng.");
      return;
    }

    let cancelled = false;
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await applicationsApi.getJobDetail(jobId);
        if (cancelled) return;
        setJob(toJobDetail(jobId, res.data));
      } catch (err) {
        if (cancelled) return;
        setJob(null);
        setError(err instanceof Error ? err.message : "Không tải được tin tuyển dụng.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchJob();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href={ROUTES.home} className="flex items-center gap-1 transition hover:text-primary">
            <Home className="h-3.5 w-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link href={ROUTES.jobs} className="transition hover:text-primary">
            Việc làm
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="line-clamp-1 font-semibold text-slate-800">
            {job?.title || "Chi tiết tin"}
          </span>
        </nav>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải tin tuyển dụng...
          </div>
        ) : error || !job ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-3">
                <p>{error ?? "Không tìm thấy tin tuyển dụng."}</p>
                <Link
                  href={ROUTES.jobs}
                  className="inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white"
                >
                  Quay lại danh sách việc làm
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-8">
                <JobHeaderCard
                  job={job}
                  onOpenApplyModal={() => setIsApplyModalOpen(true)}
                />
                <JobContentSections job={job} />
              </div>
              <div className="lg:col-span-4">
                <JobSidebar company={job.company} relatedJobs={[]} />
              </div>
            </div>

            <div className="pt-2">
              <JobNewsletter />
            </div>

            <ApplyModal
              isOpen={isApplyModalOpen}
              onClose={() => setIsApplyModalOpen(false)}
              jobId={job.id}
              jobTitle={job.title}
              companyName={job.company.name}
              companyLogoUrl={job.company.logoUrl}
              location={job.location}
              salary={job.salary}
              onApplySuccess={() => {
                setJob((prev) => (prev ? { ...prev, hasApplied: true } : prev));
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
