"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrendPoint } from "@/services/admin-statistics.service";
import {
  DateRangePopover,
  type DashboardDateFilterState,
} from "./date-range-popover";

type TrendChartProps = {
  data: TrendPoint[];
  filter: DashboardDateFilterState;
  onApplyFilter: (newFilter: DashboardDateFilterState) => void;
  loading?: boolean;
};

export function TrendChart({
  data,
  filter,
  onApplyFilter,
  loading,
}: TrendChartProps) {
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return String(value);
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Xu hướng tin đăng & ứng tuyển
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Dữ liệu hoạt động hệ thống theo thời gian
            </p>
          </div>

          {/* Bộ lọc khoảng ngày chuẩn giao diện popover đặt tại góc biểu đồ */}
          <div>
            <DateRangePopover filter={filter} onApplyFilter={onApplyFilter} />
          </div>
        </div>

        <div className="relative mt-6 h-72 w-full">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center animate-pulse">
              <div className="h-56 w-full rounded-xl bg-slate-100/80" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              Chưa có dữ liệu xu hướng trong khoảng thời gian này
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="appsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />

                <XAxis
                  dataKey="formattedDate"
                  tickLine={false}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  dy={8}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxis}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  dx={-4}
                  allowDecimals={false}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-xs">
                          <p className="font-semibold text-slate-300">
                            {String(label).includes(":") ? `Thời điểm ${label}` : `Ngày ${label}`}
                          </p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-blue-500" />
                              <span className="text-slate-300">
                                Tin tuyển dụng:
                              </span>
                              <span className="font-bold text-white">
                                {payload[0]?.value || 0}
                              </span>
                            </div>
                            {payload[1] && (
                              <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-slate-400" />
                                <span className="text-slate-300">
                                  Ứng tuyển:
                                </span>
                                <span className="font-bold text-white">
                                  {payload[1]?.value || 0}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="jobs"
                  stroke="#1E40AF"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#jobsGradient)"
                  dot={{ r: 4, fill: "#1E40AF", strokeWidth: 2, stroke: "#FFFFFF" }}
                  activeDot={{ r: 6, fill: "#1E40AF", stroke: "#FFFFFF", strokeWidth: 3 }}
                />

                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#appsGradient)"
                  dot={{ r: 3, fill: "#94A3B8", strokeWidth: 2, stroke: "#FFFFFF" }}
                  activeDot={{ r: 5, fill: "#94A3B8", stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend chú giải */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-blue-800" />
            <span>Tin tuyển dụng</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-slate-400" />
            <span>Lượt ứng tuyển</span>
          </div>
        </div>
      </div>
    </div>
  );
}
