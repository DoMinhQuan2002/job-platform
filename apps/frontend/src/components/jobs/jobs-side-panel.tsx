"use client";

import Link from "next/link";
import { Bookmark, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-error";
import { getAccessToken } from "@/lib/auth-token";
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
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJobPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadSavedJobs = useCallback(async () => {
    if (!getAccessToken()) {
      setAuthenticated(false);
      setSavedJobs([]);
      setLoading(false);
      setError(false);
      return;
    }

    setAuthenticated(true);
    setLoading(true);
    setError(false);

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
      setSavedJobs(previews);
    } catch (reason) {
      setSavedJobs([]);
      if (reason instanceof ApiError && reason.statusCode === 401) {
        setAuthenticated(false);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSavedJobs();
    const syncAuth = () => void loadSavedJobs();
    window.addEventListener("storage", syncAuth);
    window.addEventListener("jp-auth-change", syncAuth);
    window.addEventListener("jp-saved-jobs-change", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("jp-auth-change", syncAuth);
      window.removeEventListener("jp-saved-jobs-change", syncAuth);
    };
  }, [loadSavedJobs]);

  const destination = authenticated ? savedJobsHref : loginHref;

  return (
    <aside className="w-full space-y-5">
      <section className="rounded-lg border border-border bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text">Việc làm đã lưu</h2>
          {authenticated && (
            <Link
              href={savedJobsHref}
              className="text-[10px] font-medium text-primary hover:underline"
            >
              Xem tất cả
            </Link>
          )}
        </div>

        {authenticated === null || loading ? (
          <div className="flex min-h-28 items-center justify-center rounded-lg bg-slate-50 text-muted">
            <Loader2 className="size-5 animate-spin" aria-label="Đang tải việc làm đã lưu" />
          </div>
        ) : !authenticated ? (
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
          {authenticated ? "Xem việc làm đã lưu" : "Đăng nhập"}
        </Link>
      </section>
    </aside>
  );
}

function CompanyLogo({ name, src }: { name: string; src?: string }) {
  const [failed, setFailed] = useState(false);
  const logoSrc = resolveStorageUrl(src);

  if (logoSrc && !failed) {
    return (
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={`Logo ${name}`}
          className="h-full w-full object-contain p-0.5"
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
