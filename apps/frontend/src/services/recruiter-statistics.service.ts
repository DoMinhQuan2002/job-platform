import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";

export type StatisticsTimeQuery = {
  days?: number;
  startDate?: string;
  endDate?: string;
};

export type OverviewData = {
  activeJobs: number;
  totalJobs: number;
  newCandidates: number;
  totalCandidates: number;
  comparison: {
    periodDays: number;
    startDate: string;
    endDate: string;
    prevStartDate: string;
    prevEndDate: string;
    prevNewCandidates: number;
    diffNewCandidates: number;
    diffTotalCandidates: number;
  };
};

export type ApplicationStatus =
  | "APPLIED"
  | "VIEWED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export type ApplicationsByStatusData = {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
};

export type RecentJob = {
  id: string;
  title: string;
  status: string;
  deadline: string;
  createdAt: string;
  applicantCount: number;
};

export type TrendPoint = {
  label: string;
  current: number;
  previous: number;
  currentDate: string;
  prevDate: string;
};

export type CandidateTrendData = {
  groupBy: "day" | "week" | "month";
  summary: {
    totalCurrent: number;
    totalPrevious: number;
    diff: number;
  };
  points: TrendPoint[];
};

const buildQuery = (query?: StatisticsTimeQuery & { jobId?: string; groupBy?: string }): string => {
  const params = new URLSearchParams();
  if (query?.days) params.set("days", String(query.days));
  if (query?.startDate) params.set("startDate", query.startDate);
  if (query?.endDate) params.set("endDate", query.endDate);
  if (query?.jobId) params.set("jobId", query.jobId);
  if (query?.groupBy) params.set("groupBy", query.groupBy);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const recruiterStatisticsApi = {
  getOverview: (query?: StatisticsTimeQuery, signal?: AbortSignal) =>
    http<ApiSuccess<OverviewData>>(
      `/recruiter/statistics/overview${buildQuery(query)}`,
      { signal },
    ),

  getApplicationsByStatus: (
    query?: StatisticsTimeQuery & { jobId?: string },
    signal?: AbortSignal,
  ) =>
    http<ApiSuccess<ApplicationsByStatusData>>(
      `/recruiter/statistics/applications-by-status${buildQuery(query)}`,
      { signal },
    ),

  getRecentJobs: (limit = 5, signal?: AbortSignal) =>
    http<ApiSuccess<RecentJob[]>>(
      `/recruiter/statistics/recent-jobs?limit=${limit}`,
      { signal },
    ),

  getCandidateTrend: (
    query?: StatisticsTimeQuery & { groupBy?: "day" | "week" | "month" },
    signal?: AbortSignal,
  ) =>
    http<ApiSuccess<CandidateTrendData>>(
      `/recruiter/statistics/candidate-trend${buildQuery(query)}`,
      { signal },
    ),
};
