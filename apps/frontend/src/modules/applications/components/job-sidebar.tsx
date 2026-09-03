"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Star,
  Globe,
  Phone,
  MapPin,
  AlertTriangle,
  Link2,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import type { CompanyDetail, RelatedJob } from "../types";
import { CompanyVerifiedBadge } from "./company-verified-badge";
import {
  copyJobLink,
  shareJobNative,
  shareJobOnFacebook,
  shareJobOnLinkedIn,
} from "../lib/share-job";

interface JobSidebarProps {
  company: CompanyDetail;
  relatedJobs: RelatedJob[];
  jobTitle?: string;
}

export function JobSidebar({ company, relatedJobs, jobTitle }: JobSidebarProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const companyJobsHref = company.id
    ? `${ROUTES.companies}/${company.id}#company-jobs`
    : `${ROUTES.jobs}?keyword=${encodeURIComponent(company.name)}`;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await copyJobLink(shareUrl);
      setCopied(true);
      toast.success("Đã sao chép link");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không sao chép được link");
    }
  };

  const handleShareFacebook = () => {
    if (!shareUrl) return;
    shareJobOnFacebook(shareUrl);
  };

  const handleShareLinkedIn = () => {
    if (!shareUrl) return;
    shareJobOnLinkedIn(shareUrl);
  };

  const handleShareMore = async () => {
    if (!shareUrl) return;
    try {
      await shareJobNative(jobTitle ?? "Tin tuyển dụng", shareUrl);
    } catch {
      toast.error("Không thể chia sẻ tin này");
    }
  };

  return (
    <aside className="space-y-5">
      <div id="company" className="rounded-xl border border-border/30 bg-white p-5 shadow-[0_4px_7.5px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold text-foreground">Về công ty</h3>

        <div className="mt-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-1">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                {company.name.slice(0, 3).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h4 className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              {company.name}
              {company.verified !== false ? <CompanyVerifiedBadge /> : null}
            </h4>
            <p className="text-xs text-muted">
              {company.industry || "Doanh nghiệp"}
              {company.size ? ` • ${company.size}` : ""}
            </p>
            {company.rating != null ? (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-foreground">{company.rating}</span>
                {company.reviewCount != null ? (
                  <span>({company.reviewCount} đánh giá)</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted">
          {company.about || "Chưa có mô tả công ty."}
        </p>

        <div className="mt-4 space-y-2 pt-4 text-sm text-muted">
          {company.website ? (
            <div className="flex items-center gap-2.5">
              <Globe className="size-4 shrink-0 text-muted-foreground" />
              <a
                href={
                  company.website.startsWith("http")
                    ? company.website
                    : `https://${company.website}`
                }
                target="_blank"
                rel="noreferrer"
                className="truncate text-foreground hover:text-primary hover:underline"
              >
                {company.website}
              </a>
            </div>
          ) : null}
          {company.phone ? (
            <div className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-foreground">{company.phone}</span>
            </div>
          ) : null}
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span className="leading-snug text-foreground">
              {company.address || "Chưa cập nhật địa chỉ"}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <Link
            href={companyJobsHref}
            className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary/5 text-sm font-medium text-primary transition hover:bg-primary/10"
          >
            Xem tất cả việc làm tại công ty
          </Link>
        </div>
      </div>

      <div className="rounded-xl bg-primary/5 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <AlertTriangle className="size-4 text-primary" />
          <span>Lưu ý khi ứng tuyển</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Hãy cẩn thận! Nhà tuyển dụng sẽ không bao giờ yêu cầu bạn thanh toán bất kỳ khoản phí nào trong quá trình tuyển dụng.
        </p>
      </div>

      <div className="rounded-xl border border-border/30 bg-white p-5 shadow-[0_4px_7.5px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Việc làm liên quan</h3>
          <Link href={companyJobsHref} className="text-xs font-medium text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>

        <div className="mt-3 space-y-2.5">
          {relatedJobs.length === 0 ? (
            <p className="text-sm text-muted">Chưa có tin tuyển dụng khác tại công ty này.</p>
          ) : (
            relatedJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="group flex items-start gap-3 rounded-lg p-3 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-50 p-1">
                  {job.logoUrl ? (
                    <img src={job.logoUrl} alt={job.companyName} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-sm bg-muted text-xs font-semibold text-muted-foreground">
                      {job.companyName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-1 text-sm font-medium text-foreground transition group-hover:text-primary">
                    {job.title}
                  </h4>
                  <p className="text-xs text-muted">{job.companyName}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span className="font-medium text-emerald-600">{job.salary}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/30 bg-white p-5 shadow-[0_4px_7.5px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold text-foreground">Chia sẻ công việc này</h3>

        <div className="mt-3 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleShareFacebook}
            className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-[#1877F2] transition hover:bg-blue-100"
            title="Chia sẻ Facebook"
            aria-label="Chia sẻ Facebook"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleShareLinkedIn}
            className="flex size-9 items-center justify-center rounded-lg bg-sky-50 text-[#0A66C2] transition hover:bg-sky-100"
            title="Chia sẻ LinkedIn"
            aria-label="Chia sẻ LinkedIn"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => void handleShareMore()}
            className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
            title="Chia sẻ qua ứng dụng khác"
            aria-label="Chia sẻ qua ứng dụng khác"
          >
            <MessageCircle className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => void handleCopyLink()}
            className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
            title="Sao chép liên kết"
            aria-label="Sao chép liên kết"
          >
            {copied ? <Check className="size-4 text-emerald-600" /> : <Link2 className="size-4" />}
          </button>
        </div>

        <div className="mt-3">
          <p className="mb-1.5 text-xs text-muted">Hoặc sao chép link</p>
          <div className="flex items-center rounded-lg border border-border/40 bg-slate-50 p-1.5 transition focus-within:bg-white focus-within:ring-1 focus-within:ring-primary/30">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 truncate bg-transparent px-2 text-sm text-slate-600 outline-none"
            />
            <button
              type="button"
              onClick={() => void handleCopyLink()}
              className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-muted shadow-xs hover:text-primary"
              aria-label="Sao chép link"
            >
              {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
