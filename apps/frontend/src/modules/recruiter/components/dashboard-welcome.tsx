"use client";

import { useRecruiterCompany } from "./recruiter-company-context";

export function DashboardWelcome() {
  const { company, loading } = useRecruiterCompany();

  return (
    <div>
      {loading ? (
        <div className="h-6 w-80 max-w-full animate-pulse rounded bg-border/70" />
      ) : (
        <h1 className="text-xl font-bold">
          Chào mừng trở lại, {company?.name ?? "Nhà tuyển dụng"}! 👋
        </h1>
      )}
      <p className="mt-1 text-xs text-muted">
        Dưới đây là tổng quan hoạt động tuyển dụng của bạn hôm nay.
      </p>
    </div>
  );
}
