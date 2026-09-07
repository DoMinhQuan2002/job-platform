"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  Send,
  Eye,
  Info,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ApiError } from "@/lib/api-error";
import { ROUTES } from "@/constants/routes";
import { applicationsApi } from "../api";
import { CandidateWorkspaceLayout } from "@/modules/candidate/components";
import { summarizeJob } from "../lib/job-summary";
import { STATUS_FILTERS, STATUS_LABEL, formatDateTime } from "../lib/status";
import type { Application, ApplicationListItem, ApplicationStatus } from "../types";

function enrichApplications(items: Application[]): ApplicationListItem[] {
  return items.map((item) => {
    if (item.job) {
      const summary = summarizeJob(item.job);
      return {
        ...item,
        jobTitle: summary.title,
        companyName: summary.companyName,
        location: summary.location,
        salary: summary.salary,
        statusBadge: summary.statusBadge,
      };
    }
    return {
      ...item,
      jobTitle: `Job #${item.jobId}`,
      companyName: "Nhà tuyển dụng",
      location: "—",
      salary: "—",
      statusBadge: { text: "Ngừng nhận hồ sơ", variant: "hidden" },
    };
  });
}

function statusBadgeClass(status: ApplicationStatus): string {
  switch (status) {
    case "ACCEPTED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "REJECTED":
    case "WITHDRAWN":
      return "bg-rose-50 text-rose-700 border-rose-100";
    case "INTERVIEW":
      return "bg-violet-50 text-violet-700 border-violet-100";
    case "VIEWED":
      return "bg-amber-50 text-amber-700 border-amber-100";
    default:
      return "bg-blue-50 text-blue-700 border-blue-100";
  }
}

export function ApplicationsPage() {
  const [items, setItems] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<ApplicationStatus | "ALL">("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    try {
      const res = await applicationsApi.list(
        activeTab === "ALL" ? undefined : { status: activeTab },
      );
      const enriched = await enrichApplications(res.data ?? []);
      setItems(enriched);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setUnauthorized(true);
        setError("Bạn cần đăng nhập bằng tài khoản ứng viên.");
      } else {
        setError(err instanceof Error ? err.message : "Không tải được danh sách đơn.");
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = items;

  const tabCountLabel = (value: ApplicationStatus | "ALL") => {
    if (activeTab === "ALL") {
      if (value === "ALL") return items.length;
      return items.filter((i) => i.status === value).length;
    }
    if (value === activeTab) return items.length;
    return null;
  };

  return (
    <CandidateWorkspaceLayout>
      <header className="space-y-2">
        <nav className="flex items-center gap-1.5 text-[13px] text-muted">
          <Link href={ROUTES.home} className="flex items-center gap-1 hover:text-primary">
            <Home className="size-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="size-3 text-muted" />
          <span className="font-semibold text-foreground">Đơn ứng tuyển</span>
        </nav>
        <h1 className="text-2xl font-bold text-foreground">Đơn ứng tuyển</h1>
        <p className="max-w-xl text-[15px] text-muted">
          Theo dõi trạng thái các vị trí bạn đã nộp hồ sơ.
        </p>
      </header>

      <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-3 text-xs sm:gap-6 sm:text-sm">
          {STATUS_FILTERS.map((tab) => {
            const count = tabCountLabel(tab.value);
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`-mb-3 border-b-2 pb-3 font-bold transition ${
                  activeTab === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
                {count != null ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải đơn ứng tuyển...
          </div>
        ) : error ? (
          <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
            {unauthorized ? (
              <Link
                href={`${ROUTES.auth.login}?redirect=${encodeURIComponent(ROUTES.applications.root)}`}
                className="inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                Đăng nhập
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => void load()}
                className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                Thử lại
              </button>
            )}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary">
              <Send className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {items.length === 0 ? "Chưa có đơn ứng tuyển" : "Không có đơn ở mục này"}
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 sm:text-sm">
              {items.length === 0
                ? "Khi bạn nộp hồ sơ vào một tin tuyển dụng, đơn sẽ xuất hiện tại đây."
                : "Thử chọn tab khác để xem các đơn còn lại."}
            </p>
            {items.length === 0 ? (
              <Link
                href={ROUTES.jobs}
                className="mt-5 inline-flex rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover sm:text-sm"
              >
                Tìm việc làm
              </Link>
            ) : null}
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 transition hover:border-slate-300 hover:shadow-2xs sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
                      <Send className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="truncate text-sm font-bold text-slate-900">
                          {item.jobTitle}
                        </h4>
                        {item.statusBadge && (
                          <span
                            className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold border ${
                              item.statusBadge.variant === "closed" || item.statusBadge.variant === "hidden"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {item.statusBadge.text}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{item.companyName}</p>
                      {item.location && item.location !== "—" ? (
                        <p className="text-xs text-slate-500">{item.location}</p>
                      ) : null}
                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {item.salary}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Nộp lúc {formatDateTime(item.appliedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClass(item.status)}`}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>
                  <Link
                    href={`${ROUTES.applications.root}/${item.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4" />
                    Chi tiết
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-xs text-blue-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="leading-relaxed">
            <span className="font-bold">Lưu ý:</span> Bạn chỉ có thể rút đơn khi trạng thái là
            &quot;Đã nộp đơn&quot; hoặc &quot;Đang xem xét&quot;.
          </p>
        </div>
      </div>
    </CandidateWorkspaceLayout>
  );
}
