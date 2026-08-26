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
  Loader2,
} from "lucide-react";
import type { DetailedApplication } from "../types";
import { Button } from "@/components/ui/button";
import { canWithdraw } from "../lib/status";
import { ROUTES } from "@/constants/routes";

interface ApplicationDetailSidebarProps {
  application: DetailedApplication;
  onOpenWithdraw: () => void;
  onViewCV: () => void;
  onDownloadCV: () => void;
  cvBusy?: boolean;
}

export function ApplicationDetailSidebar({
  application,
  onOpenWithdraw,
  onViewCV,
  onDownloadCV,
  cvBusy = false,
}: ApplicationDetailSidebarProps) {
  const { jobSummary, company } = application;
  const companyInitial = company.name.slice(0, 3).toUpperCase() || "CO";

  return (
    <aside className="space-y-6">
      <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">Thông tin tin tuyển dụng</h3>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xs">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt={company.name} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-blue-50 text-sm font-bold italic text-primary">
                {companyInitial}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 sm:text-sm">{company.name}</h4>
            {company.website ? (
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Website công ty
              </a>
            ) : (
              <Link
                href={`${ROUTES.jobs}/${application.jobId}`}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Xem tin tuyển dụng
              </Link>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-2">
          <h4 className="text-sm font-bold text-slate-900 sm:text-base">{jobSummary.title}</h4>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              <span>{jobSummary.jobType}</span>
            </span>
          </div>
        </div>

        <div className="space-y-2.5 pt-2 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{jobSummary.location}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Banknote className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="font-semibold text-slate-800">{jobSummary.salary}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Briefcase className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{jobSummary.experience}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
            <span>Đăng tin: {jobSummary.postedDate}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 shrink-0 text-slate-400" />
            <span>Hạn nộp: {jobSummary.deadline}</span>
          </div>
        </div>

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

      <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">Thao tác</h3>

        <div className="space-y-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={cvBusy || !application.resumeUrl}
            onClick={onViewCV}
            className="w-full justify-center gap-2 rounded-xl border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {cvBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 text-slate-500" />}
            <span>Xem CV đã nộp</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={cvBusy || !application.resumeUrl}
            onClick={onDownloadCV}
            className="w-full justify-center gap-2 rounded-xl border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {cvBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4 text-slate-500" />
            )}
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

      <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">Ghi chú</h3>
        <p className="text-xs leading-relaxed text-slate-500">
          Bạn có thể liên hệ nhà tuyển dụng nếu cần thêm thông tin.
        </p>
        {company.website ? (
          <a
            href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center gap-2 rounded-xl border-primary/40 py-2.5 text-xs font-semibold text-primary hover:bg-blue-50"
            >
              <Mail className="h-4 w-4" />
              <span>Liên hệ nhà tuyển dụng</span>
            </Button>
          </a>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled
            className="w-full justify-center gap-2 rounded-xl border-slate-200 py-2.5 text-xs font-semibold text-slate-400"
          >
            <Mail className="h-4 w-4" />
            <span>Chưa có thông tin liên hệ</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
