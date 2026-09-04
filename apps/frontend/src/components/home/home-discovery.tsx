"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bookmark, Mail, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { companiesApi } from "@/modules/companies/api";
import type { PublicCompany } from "@/modules/companies/types";
import { jobsApi } from "@/modules/jobs/api";
import type { Job, JobFilters } from "@/modules/jobs/types";
import { ROUTES } from "@/constants/routes";
import { getAccessToken, getAccessTokenRole } from "@/lib/auth-token";
import { resolveStorageUrl } from "@/lib/utils";

const latestJobFilters: JobFilters = {
  keyword: "",
  location: "",
  categoryId: "",
  jobMode: "",
  jobType: "",
  minSalary: "",
  maxSalary: "",
  maxExperience: "",
  sort: "newest",
  page: 1,
  size: 4,
};
function CompactCompanyLogo({ company }: { company: Job["company"] }) {
  const [failed, setFailed] = useState(false);
  const logoSrc = resolveStorageUrl(company?.logo);

  if (logoSrc && !failed) {
    return (
      <img
        src={logoSrc}
        alt={`Logo ${company.name}`}
        className="size-full object-contain "
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return <span aria-hidden="true">{initials(company?.name)}</span>;
}
export function HomeDiscovery() {
  const router = useRouter();
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [savingJobIds, setSavingJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const syncRole = () => setIsRecruiter(getAccessTokenRole() === "RECRUITER");
    syncRole();
    window.addEventListener("jp-auth-change", syncRole);
    return () => window.removeEventListener("jp-auth-change", syncRole);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      companiesApi.list(5, controller.signal),
      jobsApi.list(latestJobFilters, controller.signal),
    ])
      .then(([companiesResponse, jobsResponse]) => {
        setCompanies(companiesResponse.data.items);
        setJobs(jobsResponse.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCompanies([]);
          setJobs([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const handleSaveJob = async (jobId: string) => {
    if (!getAccessToken()) {
      const redirect = `${window.location.pathname}${window.location.search}`;
      router.push(
        `${ROUTES.auth.login}?redirect=${encodeURIComponent(redirect)}`,
      );
      return;
    }
    const job = jobs.find((item) => item.id === jobId);
    if (!job || savingJobIds.has(jobId)) return;

    const wasSaved = Boolean(job.isSaved);
    setSavingJobIds((current) => new Set(current).add(jobId));
    setJobs((current) =>
      current.map((item) =>
        item.id === jobId ? { ...item, isSaved: !wasSaved } : item,
      ),
    );

    try {
      if (wasSaved) {
        await jobsApi.unsaveJob(jobId);
      } else {
        await jobsApi.saveJob(jobId);
      }
      toast.success(wasSaved ? "Đã bỏ lưu việc làm" : "Đã lưu việc làm");
      window.dispatchEvent(new Event("jp-saved-jobs-change"));
    } catch (reason) {
      setJobs((current) =>
        current.map((item) =>
          item.id === jobId ? { ...item, isSaved: wasSaved } : item,
        ),
      );
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Không thể cập nhật việc làm đã lưu",
      );
    } finally {
      setSavingJobIds((current) => {
        const next = new Set(current);
        next.delete(jobId);
        return next;
      });
    }
  };

  return (
    <>
      <section className="py-16">
        <div className="mx-auto container px-4 sm:px-6">
          <SectionHeading title="Công ty nổi bật" href="/companies" />
          {loading ? (
            <CardSkeleton count={5} />
          ) : companies.length === 0 ? (
            <EmptyState message="Chưa có dữ liệu công ty." />
          ) : (
            <div className="flex snap-x gap-4 overflow-x-auto pb-4">
              {companies.map((company) => (
                <Link
                  href={`/companies/${company.id}`}
                  key={company.id}
                  className="flex min-w-[220px] flex-1 snap-start items-center gap-4 rounded-xl border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded border border-border bg-slate-50 p-1 text-xs font-bold text-primary">
                    <CompactCompanyLogo company={company} />
                  </div>
                  <span className="min-w-0">
                    <strong className="block truncate text-sm text-text">
                      {company.name}
                    </strong>
                    <small className="mt-1 block truncate text-xs text-muted">
                      {company.companySize
                        ? `${company.companySize} nhân sự`
                        : company.address}
                    </small>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-50 pb-16 pt-10">
        <div className="mx-auto container px-4 sm:px-6">
          <SectionHeading title="Việc làm mới nhất" href={ROUTES.jobs} />
          {loading ? (
            <CardSkeleton count={4} grid />
          ) : jobs.length === 0 ? (
            <EmptyState message="Chưa có việc làm đang tuyển." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="group relative flex min-h-[270px] flex-col rounded-xl border border-border bg-white p-5 transition hover:border-primary hover:shadow-md"
                >
                  <span className="absolute right-4 top-4 rounded bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                    Mới
                  </span>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded border border-border bg-slate-50 text-[9px] font-bold text-primary">
                      <CompactCompanyLogo company={job.company} />
                    </div>
                    <span className="max-w-[65%] truncate text-[11px] font-semibold text-muted">
                      {job.company?.name}
                    </span>
                  </div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="mb-3 pr-2 text-base font-bold leading-6 text-text transition group-hover:text-primary"
                  >
                    {job.title}
                  </Link>
                  <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {job.address}
                    </span>
                    <i className="size-1 rounded-full bg-slate-300" />
                    <strong className="text-primary">{salary(job)}</strong>
                    <i className="size-1 rounded-full bg-slate-300" />
                    <span>
                      {job.experience == null
                        ? "Không yêu cầu"
                        : `${job.experience} năm`}
                    </span>
                  </div>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {job.jobSkills?.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="rounded bg-slate-100 px-2 py-1 text-[10px] text-muted"
                      >
                        {item.skill.name}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                    <span className="text-[10px] text-slate-500">
                      {postedDate(job.createdAt)}
                    </span>
                    {!isRecruiter && (
                      <button
                        type="button"
                        aria-label={
                          job.isSaved
                            ? `Bỏ lưu việc làm ${job.title}`
                            : `Lưu việc làm ${job.title}`
                        }
                        title={job.isSaved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
                        disabled={savingJobIds.has(job.id)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSaveJob(job.id);
                        }}
                        className={`transition-colors disabled:opacity-50 ${
                          job.isSaved
                            ? "text-amber-400"
                            : "text-slate-500 hover:text-primary"
                        }`}
                      >
                        <Bookmark
                          className={`size-5 transition-colors ${
                            job.isSaved ? "fill-amber-400 text-amber-400" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-xl font-bold text-text sm:text-2xl">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Xem tất cả
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
function CardSkeleton({
  count,
  grid = false,
}: {
  count: number;
  grid?: boolean;
}) {
  return (
    <div
      className={
        grid
          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          : "flex gap-4 overflow-hidden"
      }
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-28 min-w-[220px] flex-1 animate-pulse rounded-xl border border-border bg-white p-4"
        >
          <div className="h-10 w-10 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted">
      {message}
    </div>
  );
}
function initials(name = "JP") {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
function salary(job: Job) {
  if (job.isNegotiable || (!job.salaryMin && !job.salaryMax))
    return "Thỏa thuận";
  const format = (value: string | null) =>
    value ? `${Math.round(Number(value) / 1_000_000)} triệu` : "";
  return [format(job.salaryMin), format(job.salaryMax)]
    .filter(Boolean)
    .join(" - ");
}
function postedDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
