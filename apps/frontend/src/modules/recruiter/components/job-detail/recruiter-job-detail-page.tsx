"use client";

import Link from "next/link";
import { ArrowLeft, CircleAlert, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { recruiterJobsApi, type RecruiterJobDetail } from "@/services/recruiter-jobs.service";
import { JobDetailContent } from "./job-detail-content";
import { JobDetailSidebar } from "./job-detail-sidebar";
import { JobDetailSkeleton } from "./job-detail-skeleton";
import { JobSummaryCard } from "./job-summary-card";

export function RecruiterJobDetailPage({ id }: { id: string }) {
  const [job, setJob] = useState<RecruiterJobDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;
    recruiterJobsApi.detail(id, controller.signal).then((response) => {
      if (!ignore) setJob(response.data);
    }).catch((requestError: unknown) => {
      if (!ignore) setError(requestError instanceof Error ? requestError.message : "Không thể tải chi tiết tin tuyển dụng.");
    });
    return () => { ignore = true; controller.abort(); };
  }, [id, reloadKey]);

  const retry = useCallback(() => {
    setJob(null);
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  const updateStatus = async (status: "OPEN" | "CLOSED" | "HIDDEN") => {
    if (!job || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const response = await recruiterJobsApi.updateStatus(job.id, status);
      setJob((current) => current ? { ...current, status: response.data.status, updatedAt: response.data.updatedAt } : current);
      toast.success("Cập nhật trạng thái tin thành công");
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Không thể cập nhật trạng thái tin");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!job && !error) return <JobDetailSkeleton />;
  if (!job) return <div className="mx-auto flex min-h-[420px] max-w-6xl items-center justify-center"><div className="max-w-md rounded-lg border border-danger/20 bg-surface p-8 text-center shadow-sm"><CircleAlert className="mx-auto mb-3 size-10 text-danger" /><h1 className="font-semibold text-text">Không thể tải chi tiết tin</h1><p className="mt-2 text-sm text-muted">{error}</p><div className="mt-5 flex justify-center gap-2"><Link href="/recruiter/jobs" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text">Quay lại</Link><button type="button" onClick={retry} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"><RefreshCw className="size-4" />Thử lại</button></div></div></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Link href="/recruiter/jobs" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"><ArrowLeft className="size-3.5" />Quay lại danh sách tin</Link>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4"><JobSummaryCard job={job} /><JobDetailContent job={job} /></div>
        <JobDetailSidebar job={job} updatingStatus={updatingStatus} onUpdateStatus={updateStatus} />
      </div>
    </div>
  );
}
