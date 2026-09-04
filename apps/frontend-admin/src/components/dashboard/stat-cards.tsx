import React from "react";
import {
  Users,
  Building2,
  Briefcase,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { StatisticsOverview } from "@/services/admin-statistics.service";

type StatCardsProps = {
  data?: StatisticsOverview;
  loading?: boolean;
};

export function StatCards({ data, loading }: StatCardsProps) {
  const cardsConfig = [
    {
      id: "users",
      title: "Người dùng",
      subtitle: "Tổng số người dùng",
      value: data?.cards?.users?.total ?? 0,
      growthRate: data?.cards?.users?.growthRate ?? 0,
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      id: "companies",
      title: "Công ty",
      subtitle: "Công ty hoạt động",
      value: data?.cards?.companies?.total ?? 0,
      growthRate: data?.cards?.companies?.growthRate ?? 0,
      icon: Building2,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      id: "jobs",
      title: "Tin tuyển dụng",
      subtitle: "Tổng số tin",
      value: data?.cards?.jobs?.total ?? 0,
      growthRate: data?.cards?.jobs?.growthRate ?? 0,
      icon: Briefcase,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
    },
    {
      id: "pendingJobs",
      title: "Tin chờ duyệt",
      subtitle: "Cần xử lý",
      value: data?.cards?.pendingJobs?.total ?? 0,
      growthRate: data?.cards?.pendingJobs?.growthRate ?? 0,
      icon: ClipboardCheck,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-200/70 bg-white p-5 shadow-xs"
          >
            <div className="size-11 rounded-xl bg-slate-100" />
            <div className="mt-4 h-3.5 w-20 rounded bg-slate-100" />
            <div className="mt-2 h-7 w-28 rounded bg-slate-200" />
            <div className="mt-1 h-3 w-24 rounded bg-slate-100" />
            <div className="mt-4 h-6 w-36 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardsConfig.map((card) => {
        const Icon = card.icon;
        const isPositive = card.growthRate >= 0;
        const GrowthIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <div
            key={card.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
          >
            <div>
              <div
                className={`grid size-11 place-items-center rounded-xl ${card.iconBg} ${card.iconColor}`}
              >
                <Icon className="size-5" />
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500">
                {card.title}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {card.value.toLocaleString("vi-VN")}
              </p>
              <p className="text-xs text-slate-400">{card.subtitle}</p>
            </div>

            <div className="mt-4 pt-1">
              <div
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                  isPositive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                <GrowthIcon className="size-3.5" />
                <span>
                  {isPositive ? "↑" : "↓"} {Math.abs(card.growthRate)}%
                </span>
                <span className="text-slate-400 font-normal">
                  so với tháng trước
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
