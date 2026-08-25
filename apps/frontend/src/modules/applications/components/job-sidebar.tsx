"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Star,
  Globe,
  Phone,
  MapPin,
  AlertTriangle,
  Bookmark,
  Share2,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";
import type { CompanyDetail, RelatedJob } from "../types";



interface JobSidebarProps {
  company: CompanyDetail;
  relatedJobs: RelatedJob[];
}

export function JobSidebar({ company, relatedJobs }: JobSidebarProps) {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://jobplatform.vn/viec-lam/frontend-developer";

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside className="space-y-6">
      {/* 1. Về công ty */}
      <div id="company" className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">Về công ty</h3>

        <div className="mt-4 flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-2xs">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-blue-50 font-bold text-primary">
                {company.name.slice(0, 3).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900">{company.name}</h4>
              <CheckCircle className="h-4 w-4 fill-emerald-500 text-white shrink-0" />
            </div>
            <p className="text-xs text-slate-500">
              {company.industry || "Công nghệ thông tin"} • {company.size || "1.000+ nhân viên"}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-800">{company.rating || 4.6}</span>
              <span>({company.reviewCount || 328} đánh giá)</span>
            </div>
          </div>
        </div>

        {/* About snippet */}
        <p className="mt-4 text-xs leading-relaxed text-slate-600">
          {company.about ||
            "FPT Software là công ty công nghệ hàng đầu Việt Nam, thành viên của Tập đoàn FPT. Chúng tôi cung cấp các dịch vụ và giải pháp phần mềm đẳng cấp thế giới cho hàng trăm khách hàng toàn cầu."}
        </p>

        {/* Company contact info */}
        <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <Globe className="h-4 w-4 shrink-0 text-slate-400" />
            <a
              href={`https://${company.website || "www.fpt-software.com"}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-700 hover:text-primary hover:underline truncate"
            >
              {company.website || "www.fpt-software.com"}
            </a>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="text-slate-700">{company.phone || "024 7300 9999"}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
            <span className="text-slate-700 leading-snug">
              {company.address || "Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội"}
            </span>
          </div>
        </div>

        {/* Button xem tất cả việc làm */}
        <div className="mt-5">
          <button className="w-full rounded-xl border border-primary/40 bg-white py-2.5 text-xs font-semibold text-primary transition hover:bg-blue-50">
            Xem tất cả việc làm tại công ty
          </button>
        </div>
      </div>

      {/* 2. Lưu ý khi ứng tuyển */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <span>Lưu ý khi ứng tuyển</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-blue-800">
          Hãy cẩn thận! Nhà tuyển dụng sẽ không bao giờ yêu cầu bạn thanh toán bất kỳ khoản phí nào trong quá trình tuyển dụng.
        </p>
      </div>

      {/* 3. Việc làm liên quan */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Việc làm liên quan</h3>
          <Link href="/jobs" className="text-xs font-semibold text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>

        <div className="mt-4 space-y-3.5">
          {relatedJobs.map((job) => (
            <div
              key={job.id}
              className="group flex items-start justify-between rounded-xl border border-slate-100 p-3 hover:border-slate-200 hover:bg-slate-50/60 transition"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-white p-1">
                  {job.logoUrl ? (
                    <img src={job.logoUrl} alt={job.companyName} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-sm bg-slate-100 font-bold text-slate-600 text-xs">
                      {job.companyName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition line-clamp-1">
                    {job.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">{job.companyName}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                    <span>📍 {job.location}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600">💵 {job.salary}</span>
                  </div>
                </div>
              </div>

              <button
                className="text-slate-400 hover:text-primary transition p-1"
                aria-label="Lưu công việc"
              >
                <Bookmark className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Chia sẻ công việc này */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">Chia sẻ công việc này</h3>

        {/* Social buttons */}
        <div className="mt-4 flex items-center gap-3">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1877F2] hover:bg-blue-100 transition"
            title="Chia sẻ Facebook"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-[#0A66C2] hover:bg-sky-100 transition"
            title="Chia sẻ LinkedIn"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
            title="Gửi tin nhắn"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            onClick={handleCopyLink}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            title="Sao chép liên kết"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Copy link input */}
        <div className="mt-4">
          <p className="text-xs text-slate-500 font-medium mb-1.5">Hoặc sao chép link</p>
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/70 p-1.5 focus-within:border-primary focus-within:bg-white transition">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-transparent px-2 text-xs text-slate-600 outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 hover:text-primary shadow-2xs border border-slate-200/70"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
