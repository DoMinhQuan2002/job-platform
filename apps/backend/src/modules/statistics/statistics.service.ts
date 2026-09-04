// Thống kê tổng quan hệ thống và xu hướng hoạt động
import { AppDataSource } from "@/data-source";

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
  // Giữ lại các trường cũ để tương thích ngược
  totalCandidates: number;
  totalRecruiters: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  // Các trường mới cho Dashboard
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

const calcGrowthRate = (current: number, previous: number): number => {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }
  const rate = ((current - previous) / previous) * 100;
  return Math.round(rate * 10) / 10;
};

export type TrendsQuery = {
  range?: string;
  fromDate?: string;
  toDate?: string;
};

export const statisticsService = {
  /** GET /admin/statistics */
  async overview(): Promise<StatisticsOverview> {
    const [row] = await AppDataSource.query<
      Array<{
        totalCandidates: string;
        totalRecruiters: string;
        totalCompanies: string;
        totalJobs: string;
        totalApplications: string;
        // Số liệu tháng trước để tính tăng trưởng
        prevMonthUsers: string;
        activeCompanies: string;
        prevMonthActiveCompanies: string;
        prevMonthJobs: string;
        pendingJobs: string;
        prevMonthPendingJobs: string;
        // Phân bố trạng thái tin tuyển dụng
        jobsOpen: string;
        jobsPending: string;
        jobsClosed: string;
        jobsRejected: string;
      }>
    >(`
      SELECT
        -- Tổng người dùng hiện tại
        (SELECT COUNT(*) FROM users u JOIN roles r ON r.id = u.role_id
          WHERE r.name = 'CANDIDATE' AND u.deleted_at IS NULL) AS "totalCandidates",
        (SELECT COUNT(*) FROM users u JOIN roles r ON r.id = u.role_id
          WHERE r.name = 'RECRUITER' AND u.deleted_at IS NULL) AS "totalRecruiters",
        -- Người dùng trước tháng này
        (SELECT COUNT(*) FROM users u JOIN roles r ON r.id = u.role_id
          WHERE r.name IN ('CANDIDATE', 'RECRUITER')
            AND u.deleted_at IS NULL
            AND u.created_at < date_trunc('month', CURRENT_TIMESTAMP)) AS "prevMonthUsers",

        -- Công ty
        (SELECT COUNT(*) FROM companies WHERE deleted_at IS NULL) AS "totalCompanies",
        (SELECT COUNT(*) FROM companies WHERE status = 'ACTIVE' AND deleted_at IS NULL) AS "activeCompanies",
        (SELECT COUNT(*) FROM companies
          WHERE status = 'ACTIVE' AND deleted_at IS NULL
            AND created_at < date_trunc('month', CURRENT_TIMESTAMP)) AS "prevMonthActiveCompanies",

        -- Tin tuyển dụng
        (SELECT COUNT(*) FROM jobs WHERE deleted_at IS NULL) AS "totalJobs",
        (SELECT COUNT(*) FROM jobs
          WHERE deleted_at IS NULL
            AND created_at < date_trunc('month', CURRENT_TIMESTAMP)) AS "prevMonthJobs",

        -- Tin chờ duyệt
        (SELECT COUNT(*) FROM jobs WHERE status = 'PENDING' AND deleted_at IS NULL) AS "pendingJobs",
        (SELECT COUNT(*) FROM jobs
          WHERE status = 'PENDING' AND deleted_at IS NULL
            AND created_at < date_trunc('month', CURRENT_TIMESTAMP)) AS "prevMonthPendingJobs",

        -- Ứng tuyển
        (SELECT COUNT(*) FROM applications) AS "totalApplications",

        -- Trạng thái tin tuyển dụng cho biểu đồ tròn
        (SELECT COUNT(*) FROM jobs WHERE status IN ('OPEN', 'APPROVED') AND deleted_at IS NULL) AS "jobsOpen",
        (SELECT COUNT(*) FROM jobs WHERE status = 'PENDING' AND deleted_at IS NULL) AS "jobsPending",
        (SELECT COUNT(*) FROM jobs WHERE status IN ('CLOSED', 'HIDDEN') AND deleted_at IS NULL) AS "jobsClosed",
        (SELECT COUNT(*) FROM jobs WHERE status = 'REJECTED' AND deleted_at IS NULL) AS "jobsRejected"
    `);

    const totalCandidates = Number(row.totalCandidates || 0);
    const totalRecruiters = Number(row.totalRecruiters || 0);
    const currentUsers = totalCandidates + totalRecruiters;
    const prevMonthUsers = Number(row.prevMonthUsers || 0);

    const activeCompanies = Number(row.activeCompanies || 0);
    const prevMonthActiveCompanies = Number(row.prevMonthActiveCompanies || 0);

    const totalJobs = Number(row.totalJobs || 0);
    const prevMonthJobs = Number(row.prevMonthJobs || 0);

    const pendingJobs = Number(row.pendingJobs || 0);
    const prevMonthPendingJobs = Number(row.prevMonthPendingJobs || 0);

    const jobsOpen = Number(row.jobsOpen || 0);
    const jobsPending = Number(row.jobsPending || 0);
    const jobsClosed = Number(row.jobsClosed || 0);
    const jobsRejected = Number(row.jobsRejected || 0);
    const totalStatusJobs = jobsOpen + jobsPending + jobsClosed + jobsRejected;

    const calcPercent = (val: number) =>
      totalStatusJobs > 0 ? Math.round((val / totalStatusJobs) * 1000) / 10 : 0;

    return {
      totalCandidates,
      totalRecruiters,
      totalCompanies: Number(row.totalCompanies || 0),
      totalJobs,
      totalApplications: Number(row.totalApplications || 0),
      cards: {
        users: {
          total: currentUsers,
          growthRate: calcGrowthRate(currentUsers, prevMonthUsers),
        },
        companies: {
          total: activeCompanies,
          growthRate: calcGrowthRate(activeCompanies, prevMonthActiveCompanies),
        },
        jobs: {
          total: totalJobs,
          growthRate: calcGrowthRate(totalJobs, prevMonthJobs),
        },
        pendingJobs: {
          total: pendingJobs,
          growthRate: calcGrowthRate(pendingJobs, prevMonthPendingJobs),
        },
      },
      jobStatusDistribution: {
        open: { count: jobsOpen, percentage: calcPercent(jobsOpen) },
        pending: { count: jobsPending, percentage: calcPercent(jobsPending) },
        closed: { count: jobsClosed, percentage: calcPercent(jobsClosed) },
        rejected: { count: jobsRejected, percentage: calcPercent(jobsRejected) },
        total: totalStatusJobs,
      },
    };
  },

  /** GET /admin/statistics/trends?range=7d|30d|90d&fromDate=...&toDate=... */
  async trends(query: TrendsQuery = {}): Promise<TrendPoint[]> {
    const { range, fromDate, toDate } = query;

    if (fromDate && toDate) {
      const isSameDay = fromDate === toDate;

      if (isSameDay) {
        // Cùng 1 ngày (ví dụ Hôm nay), hiển thị theo các mốc giờ trong ngày
        const rows = await AppDataSource.query<
          Array<{
            date: string;
            formattedDate: string;
            jobs: number;
            applications: number;
          }>
        >(
          `
          WITH hours AS (
            SELECT generate_series(
              date_trunc('day', $1::timestamptz),
              date_trunc('day', $1::timestamptz) + interval '22 hours',
              interval '2 hours'
            ) AS hour
          ),
          job_counts AS (
            SELECT date_trunc('hour', created_at) AS hour, COUNT(*) AS count
            FROM jobs
            WHERE created_at >= date_trunc('day', $1::timestamptz)
              AND created_at < date_trunc('day', $1::timestamptz) + interval '1 day'
              AND deleted_at IS NULL
            GROUP BY 1
          ),
          app_counts AS (
            SELECT date_trunc('hour', created_at) AS hour, COUNT(*) AS count
            FROM applications
            WHERE created_at >= date_trunc('day', $1::timestamptz)
              AND created_at < date_trunc('day', $1::timestamptz) + interval '1 day'
            GROUP BY 1
          )
          SELECT
            to_char(h.hour, 'YYYY-MM-DD HH24:MI') AS date,
            to_char(h.hour, 'HH24:MI') AS "formattedDate",
            COALESCE(j.count, 0)::int AS jobs,
            COALESCE(a.count, 0)::int AS applications
          FROM hours h
          LEFT JOIN job_counts j ON j.hour = h.hour
          LEFT JOIN app_counts a ON a.hour = h.hour
          ORDER BY h.hour ASC;
          `,
          [fromDate],
        );

        return rows.map((r) => ({
          date: r.date,
          formattedDate: r.formattedDate,
          jobs: Number(r.jobs),
          applications: Number(r.applications),
        }));
      }

      // Khoảng ngày từ fromDate đến toDate
      const rows = await AppDataSource.query<
        Array<{
          date: string;
          formattedDate: string;
          jobs: number;
          applications: number;
        }>
      >(
        `
        WITH dates AS (
          SELECT generate_series(
            date_trunc('day', $1::timestamptz),
            date_trunc('day', $2::timestamptz),
            interval '1 day'
          )::date AS day
        ),
        job_counts AS (
          SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS count
          FROM jobs
          WHERE created_at >= date_trunc('day', $1::timestamptz)
            AND created_at <= date_trunc('day', $2::timestamptz) + interval '1 day' - interval '1 millisecond'
            AND deleted_at IS NULL
          GROUP BY 1
        ),
        app_counts AS (
          SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS count
          FROM applications
          WHERE created_at >= date_trunc('day', $1::timestamptz)
            AND created_at <= date_trunc('day', $2::timestamptz) + interval '1 day' - interval '1 millisecond'
          GROUP BY 1
        )
        SELECT
          to_char(d.day, 'YYYY-MM-DD') AS date,
          to_char(d.day, 'DD/MM') AS "formattedDate",
          COALESCE(j.count, 0)::int AS jobs,
          COALESCE(a.count, 0)::int AS applications
        FROM dates d
        LEFT JOIN job_counts j ON j.day = d.day
        LEFT JOIN app_counts a ON a.day = d.day
        ORDER BY d.day ASC;
        `,
        [fromDate, toDate],
      );

      return rows.map((r) => ({
        date: r.date,
        formattedDate: r.formattedDate,
        jobs: Number(r.jobs),
        applications: Number(r.applications),
      }));
    }

    const daysMap: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };
    const days = daysMap[range || "7d"] || 7;

    const rows = await AppDataSource.query<
      Array<{
        date: string;
        formattedDate: string;
        jobs: number;
        applications: number;
      }>
    >(
      `
      WITH dates AS (
        SELECT generate_series(
          date_trunc('day', CURRENT_TIMESTAMP - ($1::int - 1) * interval '1 day'),
          date_trunc('day', CURRENT_TIMESTAMP),
          interval '1 day'
        )::date AS day
      ),
      job_counts AS (
        SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS count
        FROM jobs
        WHERE created_at >= date_trunc('day', CURRENT_TIMESTAMP - ($1::int - 1) * interval '1 day')
          AND deleted_at IS NULL
        GROUP BY 1
      ),
      app_counts AS (
        SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS count
        FROM applications
        WHERE created_at >= date_trunc('day', CURRENT_TIMESTAMP - ($1::int - 1) * interval '1 day')
        GROUP BY 1
      )
      SELECT
        to_char(d.day, 'YYYY-MM-DD') AS date,
        to_char(d.day, 'DD/MM') AS "formattedDate",
        COALESCE(j.count, 0)::int AS jobs,
        COALESCE(a.count, 0)::int AS applications
      FROM dates d
      LEFT JOIN job_counts j ON j.day = d.day
      LEFT JOIN app_counts a ON a.day = d.day
      ORDER BY d.day ASC;
      `,
      [days],
    );

    return rows.map((r) => ({
      date: r.date,
      formattedDate: r.formattedDate,
      jobs: Number(r.jobs),
      applications: Number(r.applications),
    }));
  },
};
