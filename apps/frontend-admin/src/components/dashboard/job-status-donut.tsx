"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { JobStatusDistribution } from "@/services/admin-statistics.service";

type JobStatusDonutProps = {
  distribution?: JobStatusDistribution;
  loading?: boolean;
};

const STATUS_COLORS = {
  open: "#3B82F6", // Blue
  pending: "#F59E0B", // Amber/Orange
  closed: "#10B981", // Emerald/Green
  rejected: "#EF4444", // Red
};

export function JobStatusDonut({ distribution, loading }: JobStatusDonutProps) {
  const chartData = useMemo(() => {
    if (!distribution) return [];

    return [
      {
        name: "Đang tuyển",
        key: "open",
        value: distribution.open?.count || 0,
        percentage: distribution.open?.percentage || 0,
        color: STATUS_COLORS.open,
      },
      {
        name: "Chờ duyệt",
        key: "pending",
        value: distribution.pending?.count || 0,
        percentage: distribution.pending?.percentage || 0,
        color: STATUS_COLORS.pending,
      },
      {
        name: "Đã đóng",
        key: "closed",
        value: distribution.closed?.count || 0,
        percentage: distribution.closed?.percentage || 0,
        color: STATUS_COLORS.closed,
      },
      {
        name: "Bị từ chối",
        key: "rejected",
        value: distribution.rejected?.count || 0,
        percentage: distribution.rejected?.percentage || 0,
        color: STATUS_COLORS.rejected,
      },
    ];
  }, [distribution]);

  const total = distribution?.total ?? 0;

  // Nếu tất cả giá trị đều 0, tạo dummy data màu xám để donut vẫn vẽ được vòng tròn rỗng
  const displayData = useMemo(() => {
    if (total === 0) {
      return [{ name: "Chưa có dữ liệu", value: 1, color: "#E2E8F0" }];
    }
    return chartData.filter((item) => item.value > 0);
  }, [total, chartData]);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          Trạng thái tin tuyển dụng
        </h3>

        {loading ? (
          <div className="mt-8 flex flex-col items-center justify-center animate-pulse">
            <div className="size-48 rounded-full border-8 border-slate-100" />
            <div className="mt-8 w-full space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-full rounded bg-slate-100" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="relative mt-4 flex h-56 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        if (total === 0) return null;
                        return (
                          <div className="rounded-lg border border-slate-200 bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg">
                            <span className="font-semibold">{item.name}: </span>
                            <span>
                              {item.value} ({item.percentage}%)
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={displayData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={88}
                    paddingAngle={total > 0 ? 3 : 0}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {displayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Tâm tròn hiển thị Tổng cộng */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {total.toLocaleString("vi-VN")}
                </span>
                <span className="mt-0.5 text-2xs font-semibold tracking-wider text-slate-400 uppercase">
                  Tổng cộng
                </span>
              </div>
            </div>

            {/* Chú giải chi tiết */}
            <div className="mt-6 space-y-2.5">
              {chartData.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <div className="font-medium text-slate-900">
                    <span>{item.value.toLocaleString("vi-VN")}</span>
                    <span className="ml-1.5 text-slate-400 font-normal">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
