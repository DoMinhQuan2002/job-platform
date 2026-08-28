"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Bookmark,
  Share2,
  Star,
  Banknote,
  MapPin,
  Briefcase,
  Building2,
  Clock,
  Users,
  Calendar,
  Send,
  Loader2,
  Check,
  CheckCircle2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useAuthSession } from "@/lib/use-auth-session";
import type { JobDetail } from "../types";
import { applicationsApi } from "../api";
import { CompanyVerifiedBadge } from "./company-verified-badge";

function IconTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group relative">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs font-medium text-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {label}
      </span>
    </div>
  );
}

interface JobHeaderCardProps {
  job: JobDetail;
  onOpenApplyModal: () => void;
}

export function JobHeaderCard({ job, onOpenApplyModal }: JobHeaderCardProps) {
  const { isCandidate, isRecruiter, isLoggedIn } = useAuthSession();
  const canApply = isCandidate;
  const canSaveJob = isCandidate;
  const [isSaved, setIsSaved] = useState(job.isSaved || false);
  const [saving, setSaving] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleToggleSave = async () => {
    try {
      setSaving(true);
      if (isSaved) {
        await applicationsApi.unsaveJob(job.id);
        setIsSaved(false);
      } else {
        await applicationsApi.saveJob(job.id);
        setIsSaved(true);
      }
    } catch {
      // In case user is not logged in, toggle UI optimistically for preview
      setIsSaved(!isSaved);
    } finally {
      setSaving(false);
    }
  };


  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-border/30 bg-white p-5 shadow-[0_4px_7.5px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-2 sm:h-16 sm:w-16">
            {job.company.logoUrl ? (
              <img
                src={job.company.logoUrl}
                alt={job.company.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-primary/10 text-base font-bold text-primary">
                {job.company.name.slice(0, 3).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">{job.title}</h1>
            <span className="mt-1 inline-flex max-w-full flex-wrap items-center gap-1 text-sm font-semibold text-foreground">
              {job.company.name}
              {job.company.verified !== false ? <CompanyVerifiedBadge /> : null}
            </span>

            {job.company.rating != null ? (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-semibold text-foreground">{job.company.rating}</span>
                {job.company.reviewCount != null ? (
                  <span>({job.company.reviewCount} đánh giá)</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Action icons (Bookmark & Share) */}
        <div className="flex items-center gap-2 self-end sm:self-start">
          {canSaveJob ? (
            <IconTooltip label={isSaved ? "Bỏ lưu việc làm" : "Lưu việc làm"}>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleToggleSave}
                disabled={saving}
                aria-label={isSaved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
                className={cn(isSaved && "border-primary bg-primary/5 text-primary")}
              >
                {saving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Bookmark className={cn(isSaved && "fill-primary")} />
                )}
              </Button>
            </IconTooltip>
          ) : null}
          <IconTooltip label="Chia sẻ tin tuyển dụng">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={handleShare}
              aria-label="Chia sẻ tin tuyển dụng"
            >
              {copiedShare ? <Check className="text-emerald-600" /> : <Share2 />}
            </Button>
          </IconTooltip>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Banknote className="size-4" />
          </div>
          <div>
            <p className="text-xs text-muted">Mức lương</p>
            <p className="text-sm font-medium text-foreground">{job.salary}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="size-4" />
          </div>
          <div>
            <p className="text-xs text-muted">Địa điểm</p>
            <p className="text-sm font-medium text-foreground">{job.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Briefcase className="size-4" />
          </div>
          <div>
            <p className="text-xs text-muted">Loại hình</p>
            <p className="text-sm font-medium text-foreground">{job.jobType}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </div>
          <div>
            <p className="text-xs text-muted">Hình thức</p>
            <p className="text-sm font-medium text-foreground">{job.workplaceType}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Clock className="size-4" />
          </div>
          <div>
            <p className="text-xs text-muted">Kinh nghiệm</p>
            <p className="text-sm font-medium text-foreground">{job.experience}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-4" />
          </div>
          <div>
            <p className="text-xs text-muted">Số lượng tuyển</p>
            <p className="text-sm font-medium text-foreground">{job.quantity}</p>
          </div>
        </div>

        <div className="col-span-2 flex items-center gap-2.5 sm:col-span-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calendar className="size-4" />
          </div>
          <div>
            <p className="text-xs text-muted">Hạn nộp hồ sơ</p>
            <p className="text-sm font-medium text-foreground">{job.deadline}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Giới thiệu công việc
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-muted">{job.summary}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        {canApply && job.hasApplied ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              className="border-emerald-200 bg-emerald-50 text-emerald-700"
            >
              <CheckCircle2 className="size-3.5" />
              Đã ứng tuyển
            </Button>
            {job.applicationId ? (
              <Link
                href={`${ROUTES.applications.root}/${job.applicationId}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-primary text-primary hover:bg-primary/10",
                )}
              >
                Xem đơn ứng tuyển
              </Link>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleSave}
              disabled={saving}
              className={cn(isSaved && "border-primary bg-primary/5 text-primary")}
            >
              {saving ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Bookmark className={cn("size-3", isSaved && "fill-primary")} />
              )}
              {isSaved ? "Đã lưu tin" : "Lưu tin"}
            </Button>
          </div>
        ) : canApply && job.applicationStatus === "WITHDRAWN" ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              className="border-amber-200 bg-amber-50 text-amber-700"
            >
              Đã rút đơn
            </Button>
            {job.applicationId ? (
              <Link
                href={`${ROUTES.applications.root}/${job.applicationId}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-primary text-primary hover:bg-primary/10",
                )}
              >
                Xem đơn ứng tuyển
              </Link>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleSave}
              disabled={saving}
              className={cn(isSaved && "border-primary bg-primary/5 text-primary")}
            >
              {saving ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Bookmark className={cn("size-3", isSaved && "fill-primary")} />
              )}
              {isSaved ? "Đã lưu tin" : "Lưu tin"}
            </Button>
          </div>
        ) : canApply ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenApplyModal}
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Send className="size-3 -rotate-12" />
              Ứng tuyển ngay
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleSave}
              disabled={saving}
              className={cn(isSaved && "border-primary bg-primary/5 text-primary")}
            >
              {saving ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Bookmark className={cn("size-3", isSaved && "fill-primary")} />
              )}
              {isSaved ? "Đã lưu tin" : "Lưu tin"}
            </Button>
          </div>
        ) : isRecruiter ? (
          <p className="text-xs text-muted">
            Tài khoản nhà tuyển dụng không thể ứng tuyển tin tuyển dụng này.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenApplyModal}
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Send className="size-3 -rotate-12" />
              Ứng tuyển ngay
            </Button>
          </div>
        )}
        {!isLoggedIn ? (
          <p className="text-xs text-muted">
            Bạn cần đăng nhập với tài khoản ứng viên để ứng tuyển.
          </p>
        ) : null}
      </div>
    </div>
  );
}
