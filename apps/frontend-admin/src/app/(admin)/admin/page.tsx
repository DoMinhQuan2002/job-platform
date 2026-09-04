"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  adminStatisticsService,
  type StatisticsOverview,
  type TrendPoint,
} from "@/services/admin-statistics.service";
import {
  adminDashboardService,
  type RecentJob,
  type RecentSystemLog,
} from "@/services/admin-dashboard.service";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  type DashboardDateFilterState,
} from "@/components/dashboard/date-range-popover";
import { StatCards } from "@/components/dashboard/stat-cards";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { JobStatusDonut } from "@/components/dashboard/job-status-donut";
import { RecentJobsTable } from "@/components/dashboard/recent-jobs-table";
import { RecentActivities } from "@/components/dashboard/recent-activities";

const getInitialDateFilter = (): DashboardDateFilterState => {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const todayFormatted = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);

  return {
    preset: "today",
    fromDate: todayStr,
    toDate: todayStr,
    displayLabel: `Hôm nay: ${todayFormatted}`,
  };
};

export default function AdminDashboardPage() {
  const [dateFilter, setDateFilter] = useState<DashboardDateFilterState>(
    getInitialDateFilter()
  );

  const [overview, setOverview] = useState<StatisticsOverview | undefined>(
    undefined
  );
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recentLogs, setRecentLogs] = useState<RecentSystemLog[]>([]);

  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [loadingTables, setLoadingTables] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tải dữ liệu tổng quan
  const loadOverview = useCallback(async () => {
    try {
      setLoadingOverview(true);
      const data = await adminStatisticsService.getOverview();
      setOverview(data);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu tổng quan:", err);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  // Tải dữ liệu xu hướng theo khoảng ngày được lọc
  const loadTrends = useCallback(
    async (filterParams: { fromDate?: string; toDate?: string; range?: string }) => {
      try {
        setLoadingTrends(true);
        const data = await adminStatisticsService.getTrends(filterParams);
        setTrends(data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu xu hướng:", err);
      } finally {
        setLoadingTrends(false);
      }
    },
    []
  );

  // Tải danh sách tin mới và hoạt động gần nhất
  const loadRecentData = useCallback(async () => {
    try {
      setLoadingTables(true);
      const [jobs, logs] = await Promise.all([
        adminDashboardService.getRecentJobs(5),
        adminDashboardService.getRecentLogs(5),
      ]);
      setRecentJobs(jobs);
      setRecentLogs(logs);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu hoạt động gần đây:", err);
    } finally {
      setLoadingTables(false);
    }
  }, []);

  // Khởi tạo ban đầu
  useEffect(() => {
    loadOverview();
    loadRecentData();
  }, [loadOverview, loadRecentData]);

  // Tải trends khi dateFilter thay đổi
  useEffect(() => {
    loadTrends({
      fromDate: dateFilter.fromDate,
      toDate: dateFilter.toDate,
    });
  }, [dateFilter, loadTrends]);

  // Xử lý khi người dùng áp dụng filter trên biểu đồ xu hướng
  const handleApplyFilter = (newFilter: DashboardDateFilterState) => {
    setDateFilter(newFilter);
  };

  // Nút làm mới dữ liệu
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadOverview(),
      loadTrends({ fromDate: dateFilter.fromDate, toDate: dateFilter.toDate }),
      loadRecentData(),
    ]);
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Tiêu đề trang (đã bỏ bộ lọc ngày ở đầu trang) */}
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      {/* 4 Thẻ thống kê chỉ số chính */}
      <StatCards data={overview} loading={loadingOverview} />

      {/* Hàng 2: Biểu đồ xu hướng (2/3) có bộ lọc khoảng ngày & Biểu đồ trạng thái Donut (1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart
            data={trends}
            filter={dateFilter}
            onApplyFilter={handleApplyFilter}
            loading={loadingTrends}
          />
        </div>
        <div className="lg:col-span-1">
          <JobStatusDonut
            distribution={overview?.jobStatusDistribution}
            loading={loadingOverview}
          />
        </div>
      </div>

      {/* Hàng 3: Tin tuyển dụng mới nhất (1/2) & Hoạt động hệ thống (1/2) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentJobsTable jobs={recentJobs} loading={loadingTables} />
        <RecentActivities logs={recentLogs} loading={loadingTables} />
      </div>
    </div>
  );
}
