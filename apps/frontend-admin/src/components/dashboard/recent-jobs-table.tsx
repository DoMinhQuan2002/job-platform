"use client";

import React from "react";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import type { RecentJob } from "@/services/admin-dashboard.service";

type RecentJobsTableProps = {
  jobs: RecentJob[];
  loading?: boolean;
};

export function RecentJobsTable({ jobs, loading }: RecentJobsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
      case "APPROVED":
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-2xs font-medium text-emerald-700">
            Đang tuyển
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-2xs font-medium text-amber-700">
            Chờ duyệt
          </span>
        );
      case "CLOSED":
      case "HIDDEN":
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-2xs font-medium text-slate-600">
            Đã đóng
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-2xs font-medium text-rose-700">
            Bị từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-2xs font-medium text-slate-600">
            {status}
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Tin tuyển dụng mới nhất
          </h3>
          <Link
            href="/admin/jobs"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="pb-3 font-medium">Tiêu đề</th>
                <th className="pb-3 font-medium">Công ty</th>
                <th className="pb-3 text-center font-medium">Trạng thái</th>
                <th className="pb-3 text-right font-medium">Ngày đăng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5">
                      <div className="h-3.5 w-36 rounded bg-slate-100" />
                    </td>
                    <td className="py-3.5">
                      <div className="h-3.5 w-28 rounded bg-slate-100" />
                    </td>
                    <td className="py-3.5 text-center">
                      <div className="mx-auto h-5 w-16 rounded bg-slate-100" />
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="ml-auto h-3.5 w-20 rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    <div className="mx-auto grid size-10 place-items-center rounded-full bg-slate-50 text-slate-400">
                      <Briefcase className="size-5" />
                    </div>
                    <p className="mt-2 text-xs">Chưa có tin tuyển dụng nào</p>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="group transition-colors hover:bg-slate-50/60"
                  >
                    <td className="py-3 font-medium text-slate-900">
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-500">
                      {job.company?.name || "—"}
                    </td>
                    <td className="py-3 text-center">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="py-3 text-right text-slate-400">
                      {formatDate(job.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
