"use client";

import {
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  recruiterAccountApi,
  type RecruiterAccount,
} from "@/services/recruiter-account.service";

export function RecruiterAccountPage() {
  const [account, setAccount] = useState<RecruiterAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    recruiterAccountApi
      .getMe(controller.signal)
      .then((response) => setAccount(response.data))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Không thể tải thông tin cá nhân.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  if (loading) return <AccountSkeleton />;

  if (error || !account) {
    return (
      <div className="mx-auto grid min-h-[420px] max-w-4xl place-items-center">
        <div className="rounded-xl border border-danger/20 bg-surface p-8 text-center shadow-sm">
          <p className="text-sm text-danger">{error ?? "Không tìm thấy thông tin tài khoản."}</p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white"
          >
            <RefreshCw className="size-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const initials = account.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const fields = [
    { label: "Email", value: account.email, icon: Mail },
    { label: "Số điện thoại", value: account.phone || "Chưa cập nhật", icon: Phone },
    {
      label: "Ngày sinh",
      value: account.dateOfBirth
        ? new Date(account.dateOfBirth).toLocaleDateString("vi-VN")
        : "Chưa cập nhật",
      icon: CalendarDays,
    },
    {
      label: "Địa chỉ",
      value: account.addressDetail || "Chưa cập nhật",
      icon: MapPin,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-xs text-muted">Thông tin tài khoản nhà tuyển dụng của bạn.</p>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border bg-primary/5 p-6 sm:flex sm:items-center sm:gap-5">
          <div className="grid size-20 place-items-center rounded-full bg-primary text-xl font-bold text-white">
            {initials || <UserRound className="size-8" />}
          </div>
          <div className="mt-4 sm:mt-0">
            <h2 className="text-lg font-bold text-text">{account.fullName}</h2>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-[11px] font-medium text-success">
              <ShieldCheck className="size-3.5" />
              Nhà tuyển dụng
            </span>
          </div>
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-2">
          {fields.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex gap-3 bg-surface p-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] text-muted">{label}</p>
                <p className="mt-1 break-words text-sm font-medium text-text">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-5">
      <div className="h-7 w-48 rounded bg-border/70" />
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-5 border-b border-border p-6">
          <div className="size-20 rounded-full bg-border/70" />
          <div className="space-y-3"><div className="h-5 w-44 rounded bg-border/70" /><div className="h-5 w-28 rounded bg-border/50" /></div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-16 rounded-lg bg-border/40" />)}
        </div>
      </div>
    </div>
  );
}
