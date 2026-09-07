import { http } from "./http";

export type MetricWithGrowth = {
  total: number;
  growthRate: number; // Phần trăm tăng trưởng so với tháng trước (+12.5, -3.4,...)
};

export type JobStatusDistribution = {
  open: { count: number; percentage: number };
  pending: { count: number; percentage: number };
  closed: { count: number; percentage: number };
  rejected: { count: number; percentage: number };
  total: number;
};

export type StatisticsOverview = {
  totalCandidates: number;
  totalRecruiters: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  cards: {
    users: MetricWithGrowth;
    companies: MetricWithGrowth;
    jobs: MetricWithGrowth;
    pendingJobs: MetricWithGrowth;
  };
  jobStatusDistribution: JobStatusDistribution;
};

export type TrendPoint = {
  date: string;
  formattedDate: string;
  jobs: number;
  applications: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const adminStatisticsService = {
  /** Lấy thống kê tổng quan (thẻ chỉ số, % tăng trưởng, phân bố trạng thái tin) */
  async getOverview(): Promise<StatisticsOverview> {
    const res = await http<ApiResponse<StatisticsOverview>>("/admin/statistics");
    return res.data;
  },

  /** Lấy chuỗi dữ liệu xu hướng theo khoảng thời gian hoặc khoảng ngày */
  async getTrends(params?: {
    range?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<TrendPoint[]> {
    const searchParams = new URLSearchParams();
    if (params?.fromDate && params?.toDate) {
      searchParams.set("fromDate", params.fromDate);
      searchParams.set("toDate", params.toDate);
    } else if (params?.range) {
      searchParams.set("range", params.range);
    } else {
      searchParams.set("range", "7d");
    }

    const res = await http<ApiResponse<TrendPoint[]>>(
      `/admin/statistics/trends?${searchParams.toString()}`
    );
    return res.data;
  },
};
