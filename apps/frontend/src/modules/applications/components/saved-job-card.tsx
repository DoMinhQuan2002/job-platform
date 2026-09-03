"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Banknote,
  MoreHorizontal,
  Trash2,
  Share2,
  Check,
} from "lucide-react";
import type { SavedJob } from "../types";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "./company-logo";

interface SavedJobCardProps {
  job: SavedJob;
  onApply: (job: SavedJob) => void;
  onUnsave: (jobId: string) => void;
}

export function SavedJobCard({ job, onApply, onUnsave }: SavedJobCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/jobs/${job.jobId}`);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1500);
    }
  };

  return (
    <div className="relative rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 hover:shadow-2xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Logo & Job Details */}
        <div className="flex items-start gap-4">
          {/* Logo */}
          <CompanyLogo name={job.companyName} src={job.companyLogoUrl} />

          {/* Job details */}
          <div className="space-y-1.5">
            <div>
              <Link href={`/jobs/${job.jobId}`}>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 hover:text-primary transition line-clamp-1">
                  {job.title}
                </h3>
              </Link>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {job.companyName}
              </p>
            </div>

            {/* Meta attributes */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {job.location}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                {job.experience}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <Banknote className="h-3.5 w-3.5 text-slate-400" />
                {job.salary}
              </span>
            </div>

            {/* Category tag */}
            <div className="pt-0.5">
              <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {job.category}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Saved Date & Action Buttons */}
        <div className="flex flex-col sm:items-end justify-between self-stretch pt-2 sm:pt-0 gap-4">
          <span className="text-xs text-slate-400 font-medium self-start sm:self-auto">
            Lưu ngày {job.savedDate}
          </span>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Xem chi tiết */}
            <Link href={`/jobs/${job.jobId}`}>
              <Button
                variant="outline"
                className="rounded-xl border-primary/40 px-4 py-2 text-xs font-semibold text-primary hover:bg-blue-50"
              >
                Xem chi tiết
              </Button>
            </Link>

            {/* Ứng tuyển */}
            <Button
              onClick={() => onApply(job)}
              className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs"
            >
              Ứng tuyển
            </Button>

            {/* More menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
                title="Tùy chọn khác"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-10 z-20 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in">
                  <button
                    onClick={handleCopy}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Share2 className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span>{copied ? "Đã sao chép link" : "Sao chép link tin"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onUnsave(job.jobId);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Bỏ lưu việc làm</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
