// Thống kê tổng quan hệ thống — 1 câu SQL gộp 5 subquery vô hướng, không cache ở V1.
import { AppDataSource } from "@/data-source";

export type StatisticsOverview = {
  totalCandidates: number;
  totalRecruiters: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
};

export const statisticsService = {
  /** GET /admin/statistics. */
  async overview(): Promise<StatisticsOverview> {
    const [row] = await AppDataSource.query<
      Array<{
        totalCandidates: string;
        totalRecruiters: string;
        totalCompanies: string;
        totalJobs: string;
        totalApplications: string;
      }>
    >(`
      SELECT
        (SELECT COUNT(*) FROM users u JOIN roles r ON r.id = u.role_id
          WHERE r.name = 'CANDIDATE' AND u.deleted_at IS NULL) AS "totalCandidates",
        (SELECT COUNT(*) FROM users u JOIN roles r ON r.id = u.role_id
          WHERE r.name = 'RECRUITER' AND u.deleted_at IS NULL) AS "totalRecruiters",
        (SELECT COUNT(*) FROM companies WHERE deleted_at IS NULL) AS "totalCompanies",
        (SELECT COUNT(*) FROM jobs WHERE deleted_at IS NULL) AS "totalJobs",
        (SELECT COUNT(*) FROM applications) AS "totalApplications"
    `);

    return {
      totalCandidates: Number(row.totalCandidates),
      totalRecruiters: Number(row.totalRecruiters),
      totalCompanies: Number(row.totalCompanies),
      totalJobs: Number(row.totalJobs),
      totalApplications: Number(row.totalApplications),
    };
  },
};
