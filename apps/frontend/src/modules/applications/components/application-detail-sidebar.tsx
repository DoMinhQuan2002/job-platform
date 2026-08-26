"use client";

import Link from "next/link";
import {
  MapPin,
  Banknote,
  Briefcase,
  Calendar,
  Clock,
  Eye,
  Download,
  Trash2,
  Mail,
  CheckCircle2,
} from "lucide-react";
import type { DetailedApplication } from "../types";
import { Button } from "@/components/ui/button";
import { canWithdraw } from "../lib/status";
import { ROUTES } from "@/constants/routes";

interface ApplicationDetailSidebarProps {
  application: DetailedApplication;
  onOpenWithdraw: () => void;
  onViewCV: () => void;
}

export function ApplicationDetailSidebar({
  application,
  onOpenWithdraw,
  onViewCV,
}: ApplicationDetailSidebarProps) {
  const { jobSummary, company } = application;

  const handleDownloadCV = () => {
    if (application.resumeUrl) {
      window.open(application.resumeUrl, "_blank", "noopener,noreferrer");
      return;
    }
  };

  return (
    <aside className="space-y-6">
      {/* Card 1: Thông tin tin tuyển dụng */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Thông tin tin tuyển dụng</h3>

        {/* Company Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xs">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-blue-50 font-bold text-primary italic text-sm">
                FPT
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{company.name}</h4>
            <Link
              href="/companies/fpt"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Xem công ty
            </Link>
          </div>
        </div>

        {/* Job Title & Tag */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{jobSummary.title}</h4>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="h-3 w-3" />
              <span>{jobSummary.jobType}</span>
            </span>
          </div>
        </div>

        {/* Info List */}
        <div className="space-y-2.5 pt-2 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <span>{jobSummary.location}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Banknote className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800">{jobSummary.salary}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
            <span>{jobSummary.experience}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Đăng tin: {jobSummary.postedDate}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Hạn nộp: {jobSummary.deadline}</span>
          </div>
        </div>

        {/* Button xem tin */}
        <div className="pt-2">
          <Link href={`${ROUTES.jobs}/${application.jobId}`}>
            <Button
              variant="outline"
              className="w-full rounded-xl border-primary/40 text-xs font-semibold text-primary hover:bg-blue-50"
            >
              Xem tin tuyển dụng
            </Button>
          </Link>
        </div>
      </div>

      {/* Card 2: Thao tác */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-slate-900">Thao tác</h3>

        <div className="space-y-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onViewCV}
            className="w-full justify-center gap-2 rounded-xl border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-4 w-4 text-slate-500" />
            <span>Xem CV đã nộp</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadCV}
            className="w-full justify-center gap-2 rounded-xl border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Tải CV đã nộp</span>
          </Button>

          {canWithdraw(application.status) ? (
            <Button
              type="button"
              variant="outline"
              onClick={onOpenWithdraw}
              className="w-full justify-center gap-2 rounded-xl border-rose-200 bg-rose-50/40 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Rút đơn ứng tuyển</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Card 3: Ghi chú */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-slate-900">Ghi chú</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Bạn có thể liên hệ nhà tuyển dụng nếu cần thêm thông tin.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => alert("Đang mở biểu mẫu liên hệ nhà tuyển dụng...")}
          className="w-full justify-center gap-2 rounded-xl border-primary/40 py-2.5 text-xs font-semibold text-primary hover:bg-blue-50"
        >
          <Mail className="h-4 w-4" />
          <span>Liên hệ nhà tuyển dụng</span>
        </Button>
      </div>
    </aside>
  );
}
