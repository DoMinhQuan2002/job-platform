"use client";

import Link from "next/link";
import {
  Bookmark,
  BriefcaseBusiness,
  MapPin,
  RotateCcw,
  WalletCards,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { AuthRole } from "@/lib/auth-token";
import { CompanyLogo } from "@/modules/companies/components/company-detail-ui";
import {
  getAppliedApplicationId,
  useAppliedJobsMap,
} from "@/modules/applications/lib/use-applied-jobs";
import type { Job, JobSort } from "@/modules/jobs/types";

type Props = {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
  sort: JobSort;
  loading: boolean;
  error: string | null;
  handleSaveJob: (jobId: string) => void;
  savingJobIds: ReadonlySet<string>;
  onSort: (sort: JobSort) => void;
  onPage: (page: number) => void;
  onRetry: () => void;
  onClear: () => void;
  viewerRole: AuthRole | null;
};

export function JobsResults(props: Props) {
  const { jobs, total, page, totalPages, sort, loading, error } = props;
  const appliedJobs = useAppliedJobsMap();

  return (
    <section className="min-w-0 flex-1">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm text-text">
          <strong>{total.toLocaleString("vi-VN")}</strong> việc làm phù hợp
        </h2>
        <label className="flex items-center gap-2 text-xs text-muted">
          <span className="whitespace-nowrap">Sắp xếp:</span> 
          <Select
            value={sort}
            onChange={(event) => props.onSort(event.target.value as JobSort)}
            className="h-8 min-w-32"
          >
            <option value="newest">Mới nhất</option>
            <option value="salary_desc">Lương cao nhất</option>
            <option value="salary_asc">Lương thấp nhất</option>
            <option value="deadline_asc">Sắp hết hạn</option>
          </Select>
        </label>
      </div>
      {loading ? (
        <LoadingCards />
      ) : error ? (
        <StatePanel
          icon={<RotateCcw />}
          title="Không thể tải danh sách việc làm"
          description={error}
        >
          <Button onClick={props.onRetry}>Thử lại</Button>
        </StatePanel>
      ) : jobs.length === 0 ? (
        <StatePanel
          icon={<BriefcaseBusiness />}
          title="Không tìm thấy việc làm phù hợp"
          description="Hãy thử thay đổi từ khóa hoặc xóa bớt bộ lọc đang chọn."
        >
          <Button variant="outline" onClick={props.onClear}>
            Xóa bộ lọc
          </Button>
        </StatePanel>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              applicationId={getAppliedApplicationId(appliedJobs, job.id)}
              handleSaveJob={props.handleSaveJob}
              saving={props.savingJobIds.has(job.id)}
              isRecruiter={props.viewerRole === "RECRUITER"}
            />
          ))}
        </div>
      )}
      {!loading && !error && (
        <Pagination page={page} totalPages={totalPages} onPageChange={props.onPage} />
      )}
    </section>
  );
}

function JobCard({
  job,
  applicationId,
  handleSaveJob,
  saving,
  isRecruiter,
}: {
  job: Job;
  applicationId?: string;
  handleSaveJob: (jobId: string) => void;
  saving: boolean;
  isRecruiter: boolean;
}) {
  const skills =
    job.jobSkills
      ?.slice(0, 4)
      .map((item) => item.skill?.name)
      .filter(Boolean) ?? [];

  return (
    <article className="rounded-lg border border-border bg-white p-4 transition hover:border-primary/50 hover:shadow-md sm:p-5">
      <div className="flex gap-3 sm:gap-4">
        <CompanyLogo company={job.company} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-text hover:text-primary sm:text-base">
                <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-[9px] font-medium text-primary">
                  Mới
                </span>
              </h3>
              <p className="mt-1 text-xs text-muted">{job.company?.name}</p>
            </div>
            {!isRecruiter && (
              <Button
                className="group hover:bg-primary/10!"
                variant="ghost"
                size="icon-sm"
                aria-label={job.isSaved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
                title={job.isSaved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
                disabled={saving}
                onClick={() => handleSaveJob(job.id)}
              >
                <Bookmark
                  className={`size-4 transition-colors group-hover:fill-amber-400 group-hover:text-amber-400 ${job.isSaved ? "fill-amber-400 text-amber-400" : ""}`}
                />
              </Button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted sm:text-xs">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {job.address}
            </span>
            <span className="flex items-center gap-1">
              <BriefcaseBusiness className="size-3.5" />
              {job.experience == null ? "Không yêu cầu" : `${job.experience} năm`}
            </span>
            <strong className="flex items-center gap-1 text-text">
              <WalletCards className="size-3.5" />
              {salary(job)}
            </strong>
          </div>
          <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-slate-100 px-2 py-1 text-[9px] text-muted"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-[9px] text-muted">
                Đăng ngày {postedDate(job.createdAt)}
              </span>
              {isRecruiter ? (
                <Link
                  href={`/jobs/${job.id}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "border-primary text-primary! hover:bg-primary/10!",
                  })}
                >
                  Xem chi tiết
                </Link>
              ) : applicationId ? (
                <Link
                  href={`${ROUTES.applications.root}/${applicationId}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                  )}
                >
                  Đã ứng tuyển
                </Link>
              ) : (
                <Link
                  href={`/jobs/${job.id}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "border-primary text-primary! hover:bg-primary/10!",
                  })}
                >
                  Ứng tuyển ngay
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function LoadingCards() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-lg border border-border bg-white p-5"
        >
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-1/3 rounded bg-slate-100" />
          <div className="mt-8 h-3 w-4/5 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function StatePanel({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-border bg-white p-8 text-center">
      <div>
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary [&_svg]:size-6">
          {icon}
        </span>
        <h3 className="font-semibold text-text">{title}</h3>
        <p className="mx-auto mb-5 mt-2 max-w-sm text-sm text-muted">{description}</p>
        {children}
      </div>
    </div>
  );
}

function salary(job: Job) {
  if (job.isNegotiable || (!job.salaryMin && !job.salaryMax)) return "Thỏa thuận";
  const format = (value: string | null) =>
    value ? `${Math.round(Number(value) / 1_000_000)} triệu` : "";
  return [format(job.salaryMin), format(job.salaryMax)].filter(Boolean).join(" - ");
}

function postedDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
