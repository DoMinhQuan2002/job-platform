"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertCircle, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-error";
import { ROUTES } from "@/constants/routes";
import { applicationsApi } from "../api";
import { CandidateWorkspaceLayout } from "@/modules/candidate/components";
import { ApplicationDetailTimeline } from "../components/application-detail-timeline";
import { ApplicationDetailSidebar } from "../components/application-detail-sidebar";
import { WithdrawModal } from "../components/withdraw-modal";
import { summarizeJob } from "../lib/job-summary";
import { STATUS_LABEL, buildTimeline, formatDateTime } from "../lib/status";
import type { Application, DetailedApplication } from "../types";

function toDetailed(app: Application, jobRaw?: unknown): DetailedApplication {
  const job = jobRaw ? summarizeJob(jobRaw) : null;

  return {
    id: app.id,
    jobId: app.jobId,
    code: `#APP-${app.id.slice(0, 8).toUpperCase()}`,
    appliedAt: formatDateTime(app.appliedAt),
    statusText: STATUS_LABEL[app.status],
    status: app.status,
    jobTitle: job?.title ?? `Job #${app.jobId}`,
    department: job?.category ?? "—",
    workplaceType: job?.workplaceType ?? "—",
    location: job?.location ?? "—",
    expectedSalary: job?.salary ?? "—",
    coverLetterName: "—",
    resumeName: app.resumeSnapshotUrl
      ? app.resumeSnapshotUrl.split("/").pop() || "CV đính kèm"
      : "CV đính kèm",
    resumeUrl: app.resumeSnapshotUrl ?? undefined,
    company: {
      name: job?.companyName ?? "Nhà tuyển dụng",
      logoUrl: job?.companyLogoUrl,
      website: job?.companyWebsite,
    },
    jobSummary: {
      title: job?.title ?? `Job #${app.jobId}`,
      jobType: job?.jobType ?? "—",
      location: job?.location ?? "—",
      salary: job?.salary ?? "—",
      experience: job?.experience ?? "—",
      postedDate: job?.postedDate ?? "—",
      deadline: job?.deadline ?? "—",
    },
    timeline: buildTimeline(app.status, app.appliedAt),
  };
}

async function openResumeSnapshot(storagePath: string, mode: "view" | "download", fileName: string) {
  const res = await applicationsApi.getResumeSnapshotUrl(storagePath);
  const url = res.data?.url;
  if (!url) throw new Error("Không lấy được URL CV");
  if (mode === "download") {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export function ApplicationDetailPage() {
  const params = useParams();
  const appId = String(params?.id ?? "");

  const [application, setApplication] = useState<DetailedApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [cvBusy, setCvBusy] = useState(false);

  const load = useCallback(async () => {
    if (!appId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await applicationsApi.getById(appId);
      let jobRaw: unknown;
      try {
        const jobRes = await applicationsApi.getJobDetail(res.data.jobId);
        jobRaw = jobRes.data;
      } catch {
        jobRaw = undefined;
      }
      setApplication(toDetailed(res.data, jobRaw));
    } catch (err) {
      setApplication(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Không tải được chi tiết đơn",
      );
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleWithdrawSuccess = () => {
    setApplication((prev) =>
      prev
        ? {
            ...prev,
            status: "WITHDRAWN",
            statusText: STATUS_LABEL.WITHDRAWN,
            timeline: buildTimeline("WITHDRAWN", new Date().toISOString()),
          }
        : prev,
    );
  };

  const handleResumeAction = async (mode: "view" | "download") => {
    if (!application?.resumeUrl) {
      toast.error("Đơn này không có snapshot CV.");
      return;
    }
    try {
      setCvBusy(true);
      await openResumeSnapshot(application.resumeUrl, mode, application.resumeName);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không mở được CV.");
    } finally {
      setCvBusy(false);
    }
  };

  return (
    <>
      <CandidateWorkspaceLayout contentClassName="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-8">
            <Link
              href={ROUTES.applications.root}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại danh sách đơn ứng tuyển
            </Link>

            {loading ? (
              <div className="flex items-center gap-2 py-20 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải chi tiết đơn...
              </div>
            ) : error || !application ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-3">
                    <p>{error ?? "Không tìm thấy đơn ứng tuyển."}</p>
                    <button
                      type="button"
                      onClick={() => void load()}
                      className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    Chi tiết đơn ứng tuyển
                  </h1>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    ID đơn:{" "}
                    <span className="font-semibold text-slate-700">{application.code}</span> • Ứng
                    tuyển ngày {application.appliedAt}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-2.5 rounded-2xl border p-4 text-xs font-bold sm:text-sm ${
                    application.status === "WITHDRAWN" || application.status === "REJECTED"
                      ? "border-rose-100 bg-rose-50 text-rose-800"
                      : "border-emerald-100 bg-emerald-50 text-emerald-800"
                  }`}
                >
                  Trạng thái hiện tại: {application.statusText}
                </div>

                <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                  <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                    Thông tin đơn ứng tuyển
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                    <div className="flex justify-between gap-4 py-3">
                      <span className="text-slate-500">Vị trí ứng tuyển</span>
                      <span className="text-right font-bold text-slate-900">
                        {application.jobTitle}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 py-3">
                      <span className="text-slate-500">Danh mục</span>
                      <span className="text-right font-bold text-slate-900">
                        {application.department}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 py-3">
                      <span className="text-slate-500">Hình thức làm việc</span>
                      <span className="text-right font-semibold text-slate-800">
                        {application.workplaceType}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 py-3">
                      <span className="text-slate-500">Địa điểm</span>
                      <span className="text-right font-semibold text-slate-800">
                        {application.location}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 py-3">
                      <span className="text-slate-500">Mức lương</span>
                      <span className="text-right font-bold text-slate-900">
                        {application.expectedSalary}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-3">
                      <span className="text-slate-500">CV đính kèm</span>
                      {application.resumeUrl ? (
                        <button
                          type="button"
                          disabled={cvBusy}
                          onClick={() => void handleResumeAction("view")}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                        >
                          <FileText className="h-4 w-4" />
                          {application.resumeName}
                        </button>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </div>
                  </div>
                </div>

                <ApplicationDetailTimeline timeline={application.timeline} />
              </>
            )}
          </div>

          <div className="xl:col-span-4">
            {application ? (
              <ApplicationDetailSidebar
                application={application}
                cvBusy={cvBusy}
                onOpenWithdraw={() => setIsWithdrawOpen(true)}
                onViewCV={() => void handleResumeAction("view")}
                onDownloadCV={() => void handleResumeAction("download")}
              />
            ) : null}
          </div>
        </div>
      </CandidateWorkspaceLayout>

      {application ? (
        <WithdrawModal
          isOpen={isWithdrawOpen}
          onClose={() => setIsWithdrawOpen(false)}
          applicationId={application.id}
          jobTitle={application.jobTitle}
          onWithdrawSuccess={handleWithdrawSuccess}
        />
      ) : null}
    </>
  );
}
