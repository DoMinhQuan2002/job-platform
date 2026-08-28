"use client";

import { useState } from "react";
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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
      {/* Top row: Logo + Title + Action buttons */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-2 shadow-xs sm:h-20 sm:w-20">
            {job.company.logoUrl ? (
              <img
                src={job.company.logoUrl}
                alt={job.company.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-blue-50 font-bold text-primary text-xl">
                {job.company.name.slice(0, 3).toUpperCase()}
              </div>
            )}
          </div>

          {/* Job title & Company info */}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-[26px]">
              {job.title}
            </h1>
            <span className="mt-1.5 inline-flex max-w-full flex-wrap items-center gap-1 font-semibold text-slate-800">
              {job.company.name}
              {job.company.verified !== false ? <CompanyVerifiedBadge /> : null}
            </span>

            {/* Rating — chỉ hiện khi API có data */}
            {job.company.rating != null ? (
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-slate-800">{job.company.rating}</span>
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
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={handleToggleSave}
              disabled={saving}
              title={isSaved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
              className={cn(isSaved && "border-primary bg-primary/5 text-primary")}
            >
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Bookmark className={cn(isSaved && "fill-primary")} />
              )}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={handleShare}
            title="Chia sẻ tin tuyển dụng"
          >
            {copiedShare ? <Check className="text-emerald-600" /> : <Share2 />}
          </Button>
        </div>
      </div>

      {/* Grid attributes (Mức lương, Địa điểm, Loại hình, Hình thức, Kinh nghiệm, Số lượng, Hạn nộp) */}
      <div className="mt-7 grid grid-cols-2 gap-y-4 gap-x-6 sm:grid-cols-4 lg:gap-y-5 border-t border-slate-100 pt-6">
        {/* Mức lương */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <Banknote className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Mức lương</p>
            <p className="text-sm font-bold text-slate-900">{job.salary}</p>
          </div>
        </div>

        {/* Địa điểm */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Địa điểm</p>
            <p className="text-sm font-bold text-slate-900">{job.location}</p>
          </div>
        </div>

        {/* Loại hình */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Loại hình</p>
            <p className="text-sm font-bold text-slate-900">{job.jobType}</p>
          </div>
        </div>

        {/* Hình thức */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Hình thức</p>
            <p className="text-sm font-bold text-slate-900">{job.workplaceType}</p>
          </div>
        </div>

        {/* Kinh nghiệm */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Kinh nghiệm</p>
            <p className="text-sm font-bold text-slate-900">{job.experience}</p>
          </div>
        </div>

        {/* Số lượng tuyển */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Số lượng tuyển</p>
            <p className="text-sm font-bold text-slate-900">{job.quantity}</p>
          </div>
        </div>

        {/* Hạn nộp hồ sơ */}
        <div className="flex items-center gap-3 col-span-2 sm:col-span-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Hạn nộp hồ sơ</p>
            <p className="text-sm font-bold text-slate-900">{job.deadline}</p>
          </div>
        </div>
      </div>

      {/* Giới thiệu công việc & Tags */}
      <div className="mt-6 rounded-2xl bg-slate-50/70 p-4 sm:p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Giới thiệu công việc
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {job.summary}
        </p>

        {/* Skill tags */}
        <div className="mt-3.5 flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-white px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200/70 shadow-2xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-1.5 border-t border-slate-100 pt-4">
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
          <p className="text-[11px] text-muted">
            Bạn cần đăng nhập với tài khoản ứng viên để ứng tuyển.
          </p>
        ) : null}
      </div>
    </div>
  );
}
