import { AppDataSource } from "../../data-source";
import { AppError } from "../../common/errors/app-error";
import { ApplicationStatus } from "../../common/constants";
import { JOB_STATUS } from "../../common/constants/job";
import { Company } from "../../database/entities/company.entity";
import { Job } from "../../database/entities/job.entity";
import type {
  ApplicationsByStatusQuery,
  CandidateTrendQuery,
  RecentJobsQuery,
  StatisticsTimeQuery,
} from "./recruiter-statistics.dto";

interface DateRange {
  startDate: Date;
  endDate: Date;
  prevStartDate: Date;
  prevEndDate: Date;
  periodDays: number;
}

const resolveDateRange = (query: StatisticsTimeQuery): DateRange => {
  if (query.startDate && query.endDate) {
    const startDate = new Date(`${query.startDate}T00:00:00.000Z`);
    const endDate = new Date(`${query.endDate}T23:59:59.999Z`);
    const diffMs = endDate.getTime() - startDate.getTime();
    const periodDays = Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)));
    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - diffMs);

    return {
      startDate,
      endDate,
      prevStartDate,
      prevEndDate,
      periodDays,
    };
  }

  const days = query.days ?? 30;
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  const prevEndDate = startDate;
  const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    startDate,
    endDate,
    prevStartDate,
    prevEndDate,
    periodDays: days,
  };
};

const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateToDDMM = (date: Date): string => {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

const getRecruiterCompany = async (userId: string): Promise<Company> => {
  const company = await AppDataSource.getRepository(Company).findOne({
    where: { userId },
  });

  if (!company) {
    throw new AppError(404, "COMPANY_NOT_FOUND", "Nhà tuyển dụng chưa khởi tạo hồ sơ công ty.");
  }

  return company;
};

export const recruiterStatisticsService = {
  /**
   * GET /recruiter/statistics/overview
   * Lấy số tin đang tuyển, tổng tin, ứng viên mới trong kỳ, tổng ứng viên, và so sánh kỳ trước.
   */
  async getOverview(userId: string, query: StatisticsTimeQuery) {
    const company = await getRecruiterCompany(userId);
    const range = resolveDateRange(query);

    const [stats] = await AppDataSource.query<
      Array<{
        activeJobs: string;
        totalJobs: string;
        totalCandidates: string;
        newCandidates: string;
        prevNewCandidates: string;
      }>
    >(
      `
      SELECT
        (
          SELECT COUNT(*)
          FROM jobs
          WHERE company_id = $1
            AND status = $2
            AND deadline >= CURRENT_DATE
            AND deleted_at IS NULL
        ) AS "activeJobs",
        (
          SELECT COUNT(*)
          FROM jobs
          WHERE company_id = $1
            AND deleted_at IS NULL
        ) AS "totalJobs",
        (
          SELECT COUNT(a.id)
          FROM applications a
          JOIN jobs j ON j.id = a.job_id
          WHERE j.company_id = $1
            AND j.deleted_at IS NULL
        ) AS "totalCandidates",
        (
          SELECT COUNT(a.id)
          FROM applications a
          JOIN jobs j ON j.id = a.job_id
          WHERE j.company_id = $1
            AND j.deleted_at IS NULL
            AND a.applied_at >= $3
            AND a.applied_at <= $4
        ) AS "newCandidates",
        (
          SELECT COUNT(a.id)
          FROM applications a
          JOIN jobs j ON j.id = a.job_id
          WHERE j.company_id = $1
            AND j.deleted_at IS NULL
            AND a.applied_at >= $5
            AND a.applied_at < $3
        ) AS "prevNewCandidates"
      `,
      [company.id, JOB_STATUS.APPROVED, range.startDate, range.endDate, range.prevStartDate],
    );

    const activeJobs = Number(stats?.activeJobs ?? 0);
    const totalJobs = Number(stats?.totalJobs ?? 0);
    const totalCandidates = Number(stats?.totalCandidates ?? 0);
    const newCandidates = Number(stats?.newCandidates ?? 0);
    const prevNewCandidates = Number(stats?.prevNewCandidates ?? 0);
    const diffNewCandidates = newCandidates - prevNewCandidates;

    return {
      activeJobs,
      totalJobs,
      newCandidates,
      totalCandidates,
      comparison: {
        periodDays: range.periodDays,
        startDate: formatDateToYYYYMMDD(range.startDate),
        endDate: formatDateToYYYYMMDD(range.endDate),
        prevStartDate: formatDateToYYYYMMDD(range.prevStartDate),
        prevEndDate: formatDateToYYYYMMDD(range.prevEndDate),
        prevNewCandidates,
        diffNewCandidates,
        diffTotalCandidates: newCandidates,
      },
    };
  },

  /**
   * GET /recruiter/statistics/applications-by-status
   * Thống kê số lượng ứng viên theo từng trạng thái (APPLIED, VIEWED, INTERVIEW, ACCEPTED, REJECTED, WITHDRAWN).
   */
  async getApplicationsByStatus(userId: string, query: ApplicationsByStatusQuery) {
    const company = await getRecruiterCompany(userId);

    if (query.jobId) {
      const job = await AppDataSource.getRepository(Job).findOne({
        where: { id: query.jobId, companyId: company.id },
      });
      if (!job) {
        throw new AppError(
          404,
          "JOB_NOT_FOUND",
          "Tin tuyển dụng không tồn tại hoặc không thuộc công ty của bạn.",
        );
      }
    }

    const params: unknown[] = [company.id];
    let whereClause = `WHERE j.company_id = $1 AND j.deleted_at IS NULL`;

    if (query.jobId) {
      params.push(query.jobId);
      whereClause += ` AND j.id = $${params.length}`;
    }

    if (query.startDate && query.endDate) {
      const range = resolveDateRange(query);
      params.push(range.startDate);
      whereClause += ` AND a.applied_at >= $${params.length}`;
      params.push(range.endDate);
      whereClause += ` AND a.applied_at <= $${params.length}`;
    } else if (query.days) {
      const range = resolveDateRange(query);
      params.push(range.startDate);
      whereClause += ` AND a.applied_at >= $${params.length}`;
      params.push(range.endDate);
      whereClause += ` AND a.applied_at <= $${params.length}`;
    }

    const rows = await AppDataSource.query<Array<{ status: string; count: string }>>(
      `
      SELECT a.status, COUNT(a.id) AS count
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      ${whereClause}
      GROUP BY a.status
      `,
      params,
    );

    const byStatus: Record<ApplicationStatus, number> = {
      [ApplicationStatus.APPLIED]: 0,
      [ApplicationStatus.VIEWED]: 0,
      [ApplicationStatus.INTERVIEW]: 0,
      [ApplicationStatus.ACCEPTED]: 0,
      [ApplicationStatus.REJECTED]: 0,
      [ApplicationStatus.WITHDRAWN]: 0,
    };

    let total = 0;
    for (const row of rows) {
      const count = Number(row.count ?? 0);
      if (row.status in byStatus) {
        byStatus[row.status as ApplicationStatus] = count;
      }
      total += count;
    }

    return {
      total,
      byStatus,
    };
  },

  /**
   * GET /recruiter/statistics/recent-jobs
   * Lấy danh sách tin tuyển dụng gần đây kèm số lượng ứng viên đã nộp.
   */
  async getRecentJobs(userId: string, query: RecentJobsQuery) {
    const company = await getRecruiterCompany(userId);
    const limit = query.limit ?? 5;

    const rows = await AppDataSource.query<
      Array<{
        id: string;
        title: string;
        status: string;
        deadline: string;
        createdAt: string;
        applicantCount: string;
      }>
    >(
      `
      SELECT
        j.id,
        j.title,
        j.status,
        j.deadline,
        j.created_at AS "createdAt",
        COUNT(a.id)::int AS "applicantCount"
      FROM jobs j
      LEFT JOIN applications a ON a.job_id = j.id
      WHERE j.company_id = $1
        AND j.deleted_at IS NULL
      GROUP BY j.id
      ORDER BY j.created_at DESC
      LIMIT $2
      `,
      [company.id, limit],
    );

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      deadline: row.deadline,
      createdAt: row.createdAt,
      applicantCount: Number(row.applicantCount ?? 0),
    }));
  },

  /**
   * GET /recruiter/statistics/candidate-trend
   * Lấy dữ liệu chuỗi thời gian để vẽ 2 đường xu hướng: Kỳ này vs Kỳ trước.
   */
  async getCandidateTrend(userId: string, query: CandidateTrendQuery) {
    const company = await getRecruiterCompany(userId);
    const range = resolveDateRange(query);
    const groupBy = query.groupBy ?? "day";

    // Lấy số lượng nộp theo ngày trong kỳ hiện tại
    const currentRows = await AppDataSource.query<Array<{ date: string; count: string }>>(
      `
      SELECT
        TO_CHAR(a.applied_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
        COUNT(a.id)::int AS count
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      WHERE j.company_id = $1
        AND j.deleted_at IS NULL
        AND a.applied_at >= $2
        AND a.applied_at <= $3
      GROUP BY TO_CHAR(a.applied_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')
      `,
      [company.id, range.startDate, range.endDate],
    );

    // Lấy số lượng nộp theo ngày trong kỳ trước
    const previousRows = await AppDataSource.query<Array<{ date: string; count: string }>>(
      `
      SELECT
        TO_CHAR(a.applied_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
        COUNT(a.id)::int AS count
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      WHERE j.company_id = $1
        AND j.deleted_at IS NULL
        AND a.applied_at >= $2
        AND a.applied_at < $3
      GROUP BY TO_CHAR(a.applied_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')
      `,
      [company.id, range.prevStartDate, range.startDate],
    );

    const currentMap = new Map<string, number>();
    for (const r of currentRows) {
      currentMap.set(r.date, Number(r.count ?? 0));
    }

    const previousMap = new Map<string, number>();
    for (const r of previousRows) {
      previousMap.set(r.date, Number(r.count ?? 0));
    }

    const points: Array<{
      label: string;
      current: number;
      previous: number;
      currentDate: string;
      prevDate: string;
    }> = [];

    let totalCurrent = 0;
    let totalPrevious = 0;

    const dayStepMs = 24 * 60 * 60 * 1000;
    const startMs = range.startDate.getTime();
    const prevStartMs = range.prevStartDate.getTime();

    for (let i = 0; i < range.periodDays; i++) {
      const currentPointDate = new Date(startMs + i * dayStepMs);
      const prevPointDate = new Date(prevStartMs + i * dayStepMs);

      const currentDateStr = formatDateToYYYYMMDD(currentPointDate);
      const prevDateStr = formatDateToYYYYMMDD(prevPointDate);
      const label = formatDateToDDMM(currentPointDate);

      const currentCount = currentMap.get(currentDateStr) ?? 0;
      const prevCount = previousMap.get(prevDateStr) ?? 0;

      totalCurrent += currentCount;
      totalPrevious += prevCount;

      points.push({
        label,
        current: currentCount,
        previous: prevCount,
        currentDate: currentDateStr,
        prevDate: prevDateStr,
      });
    }

    return {
      groupBy,
      summary: {
        totalCurrent,
        totalPrevious,
        diff: totalCurrent - totalPrevious,
      },
      points,
    };
  },
};
