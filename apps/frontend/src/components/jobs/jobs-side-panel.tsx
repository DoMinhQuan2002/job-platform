"use client";

import Link from "next/link";
import { Bookmark, Building2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAuthSession } from "@/lib/use-auth-session";
import { resolveStorageUrl } from "@/lib/utils";
import { applicationsApi } from "@/modules/applications/api";
import { summarizeJob } from "@/modules/applications/lib/job-summary";

type SavedJobPreview = {
  id: string;
  jobId: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
};

const savedJobsHref = ROUTES.applications.savedJobs;
const loginHref = `${ROUTES.auth.login}?redirect=${encodeURIComponent(savedJobsHref)}`;

export function JobsSidePanel() {
  const { isRecruiter, isLoggedIn } = useAuthSession();
  const [savedJobs, setSavedJobs] = useState<SavedJobPreview[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (!isLoggedIn || isRecruiter) {
      return;
    }

    let ignore = false;

    const fetchJobs = async () => {
      try {
        const response = await applicationsApi.listSavedJobs();
        const previews = await Promise.all(
          (response.data ?? []).slice(0, 3).map(async (record) => {
            const detail = await applicationsApi.getJobDetail(record.jobId);
            const job = summarizeJob(detail.data);
            return {
              id: record.id,
              jobId: record.jobId,
              title: job.title,
              companyName: job.companyName,
              companyLogoUrl: job.companyLogoUrl,
            } satisfies SavedJobPreview;
          }),
        );
        if (!ignore) {
          setSavedJobs(previews);
          setError(false);
          setHasFetched(true);
        }
      } catch {
        if (!ignore) {
          setSavedJobs([]);
          setError(true);
          setHasFetched(true);
        }
      }
    };

    void fetchJobs();

    return () => {
      ignore = true;
    };
  }, [isLoggedIn, isRecruiter, refreshToken]);

  useEffect(() => {
    const handleUpdate = () => {
      setHasFetched(false);
      setRefreshToken((prev) => prev + 1);
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("jp-saved-jobs-change", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("jp-saved-jobs-change", handleUpdate);
    };
  }, []);

  const destination = isLoggedIn ? savedJobsHref : loginHref;
  const loading = isLoggedIn && !isRecruiter && !hasFetched;

  return (
    <aside className="w-full space-y-5">
      <section className="rounded-lg border border-border bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text">Việc làm đã lưu</h2>
          {isLoggedIn && !isRecruiter && (
            <Link
              href={savedJobsHref}
              className="text-[10px] font-medium text-primary hover:underline"
            >
              Xem tất cả
            </Link>
          )}
        </div>

        {isRecruiter ? (
          <div className="rounded-lg bg-slate-50 px-4 py-6 text-center">
            <Building2 className="mx-auto size-6 text-primary" />
            <p className="mt-2 text-xs text-muted">
              Bạn đang đăng nhập tài khoản Nhà tuyển dụng.
            </p>
            <Link
              href={ROUTES.recruiter.root}
              className={buttonVariants({
                variant: "outline",
                className:
                  "mt-4 w-full border-primary text-xs text-primary! hover:bg-primary/10! hover:text-primary!",
              })}
            >
              Trang nhà tuyển dụng
            </Link>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex min-h-28 items-center justify-center rounded-lg bg-slate-50 text-muted">
                <Loader2 className="size-5 animate-spin" aria-label="Đang tải việc làm đã lưu" />
              </div>
            ) : !isLoggedIn ? (
              <Message text="Đăng nhập để xem các việc làm bạn đã lưu." />
            ) : error ? (
              <Message text="Không thể tải việc làm đã lưu lúc này." />
            ) : savedJobs.length === 0 ? (
              <Message text="Bạn chưa lưu việc làm nào." />
            ) : (
              <div className="space-y-2">
                {savedJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.jobId}`}
                    className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5 transition-colors hover:bg-primary/5"
                  >
                    <CompanyLogo name={job.companyName} src={job.companyLogoUrl} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-text">{job.title}</span>
                      <span className="mt-1 block truncate text-[10px] text-muted">{job.companyName}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}

            <Link
              href={destination}
              className={buttonVariants({
                variant: "outline",
                className:
                  "mt-4 w-full border-primary text-xs text-primary! hover:bg-primary/10! hover:text-primary!",
              })}
            >
              {isLoggedIn ? "Xem việc làm đã lưu" : "Đăng nhập"}
            </Link>
          </>
        )}
      </section>
    </aside>
  );
}

function CompanyLogo({ name, src }: { name: string; src?: string }) {
  const [failed, setFailed] = useState(false);
  const logoSrc = resolveStorageUrl(src);

  if (logoSrc && !failed) {
    return (
      <span className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={`Logo ${name}`}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-white text-[10px] font-bold text-primary"
    >
      {initials || "JP"}
    </span>
  );
}

function Message({ text }: { text: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-6 text-center">
      <Bookmark className="mx-auto size-6 text-slate-400" />
      <p className="mt-2 text-xs text-muted">{text}</p>
    </div>
  );
}
