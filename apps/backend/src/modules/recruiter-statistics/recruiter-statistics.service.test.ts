import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import { AppDataSource } from "../../data-source";
import { Company } from "../../database/entities/company.entity";
import { Job } from "../../database/entities/job.entity";
import { recruiterStatisticsService } from "./recruiter-statistics.service";
import recruiterStatisticsRouter from "./recruiter-statistics.route";
import { errorMiddleware } from "../../common/middlewares/error.middleware";
import { signAccessToken } from "../../common/security/jwt";
import { AppError } from "../../common/errors/app-error";

describe("Recruiter Statistics Module", () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use("/api/v1/recruiter/statistics", recruiterStatisticsRouter);
  testApp.use(errorMiddleware);

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = "test-jwt-secret-key-1234567890";
    vi.clearAllMocks();
  });

  const recruiterToken = (userId = "10") =>
    signAccessToken({ sub: userId, email: "recruiter@test.com", role: "RECRUITER" });

  const candidateToken = () =>
    signAccessToken({ sub: "20", email: "candidate@test.com", role: "CANDIDATE" });

  describe("Authentication & Authorization", () => {
    it("should return 401 UNAUTHORIZED when no token is provided", async () => {
      const res = await request(testApp).get("/api/v1/recruiter/statistics/overview");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        success: false,
        errors: [{ code: "UNAUTHORIZED" }],
      });
    });

    it("should return 403 FORBIDDEN when user has CANDIDATE role", async () => {
      const res = await request(testApp)
        .get("/api/v1/recruiter/statistics/overview")
        .set("Authorization", `Bearer ${candidateToken()}`);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        success: false,
        errors: [{ code: "FORBIDDEN" }],
      });
    });

    it("should return 404 NOT_FOUND when recruiter has no company", async () => {
      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: vi.fn().mockResolvedValue(null),
      } as any);

      const res = await request(testApp)
        .get("/api/v1/recruiter/statistics/overview")
        .set("Authorization", `Bearer ${recruiterToken()}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        success: false,
        message: "Nhà tuyển dụng chưa khởi tạo hồ sơ công ty.",
      });
    });
  });

  describe("GET /api/v1/recruiter/statistics/overview", () => {
    const mockCompany = {
      id: "1",
      userId: "10",
      name: "Tech Corp",
    } as unknown as Company;

    it("should return overview statistics with default 30 days", async () => {
      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: vi.fn().mockResolvedValue(mockCompany),
      } as any);

      vi.spyOn(AppDataSource, "query").mockResolvedValueOnce([
        {
          activeJobs: "12",
          totalJobs: "25",
          totalCandidates: "156",
          newCandidates: "48",
          prevNewCandidates: "33",
        },
      ]);

      const res = await request(testApp)
        .get("/api/v1/recruiter/statistics/overview")
        .set("Authorization", `Bearer ${recruiterToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.activeJobs).toBe(12);
      expect(res.body.data.totalJobs).toBe(25);
      expect(res.body.data.newCandidates).toBe(48);
      expect(res.body.data.totalCandidates).toBe(156);
      expect(res.body.data.comparison.diffNewCandidates).toBe(15);
      expect(res.body.data.comparison.prevNewCandidates).toBe(33);
      expect(res.body.data.comparison.periodDays).toBe(30);
    });

    it("should handle custom days query parameter", async () => {
      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: vi.fn().mockResolvedValue(mockCompany),
      } as any);

      vi.spyOn(AppDataSource, "query").mockResolvedValueOnce([
        {
          activeJobs: "5",
          totalJobs: "10",
          totalCandidates: "50",
          newCandidates: "10",
          prevNewCandidates: "8",
        },
      ]);

      const res = await request(testApp)
        .get("/api/v1/recruiter/statistics/overview?days=7")
        .set("Authorization", `Bearer ${recruiterToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.comparison.periodDays).toBe(7);
      expect(res.body.data.comparison.diffNewCandidates).toBe(2);
    });

    it("should handle custom startDate and endDate parameters", async () => {
      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: vi.fn().mockResolvedValue(mockCompany),
      } as any);

      vi.spyOn(AppDataSource, "query").mockResolvedValueOnce([
        {
          activeJobs: "8",
          totalJobs: "15",
          totalCandidates: "80",
          newCandidates: "20",
          prevNewCandidates: "15",
        },
      ]);

      const res = await request(testApp)
        .get("/api/v1/recruiter/statistics/overview?startDate=2026-08-01&endDate=2026-08-15")
        .set("Authorization", `Bearer ${recruiterToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.comparison.startDate).toBe("2026-08-01");
      expect(res.body.data.comparison.endDate).toBe("2026-08-15");
      expect(res.body.data.comparison.periodDays).toBe(15);
    });

    it("should return 400 when startDate is after endDate", async () => {
      const res = await request(testApp)
        .get("/api/v1/recruiter/statistics/overview?startDate=2026-08-20&endDate=2026-08-10")
        .set("Authorization", `Bearer ${recruiterToken()}`);

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/recruiter/statistics/applications-by-status", () => {
    const mockCompany = {
      id: "1",
      userId: "10",
      name: "Tech Corp",
    } as unknown as Company;

    it("should return distribution of applications by status", async () => {
      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: vi.fn().mockResolvedValue(mockCompany),
      } as any);

      vi.spyOn(AppDataSource, "query").mockResolvedValueOnce([
        { status: "APPLIED", count: "78" },
        { status: "VIEWED", count: "32" },
        { status: "INTERVIEW", count: "18" },
        { status: "ACCEPTED", count: "12" },
        { status: "REJECTED", count: "16" },
      ]);

      const res = await request(testApp)
        .get("/api/v1/recruiter/statistics/applications-by-status")
        .set("Authorization", `Bearer ${recruiterToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(156);
      expect(res.body.data.byStatus).toEqual({
        APPLIED: 78,
        VIEWED: 32,
        INTERVIEW: 18,
        ACCEPTED: 12,
        REJECTED: 16,
        WITHDRAWN: 0,
      });
    });

    it("should filter by jobId when provided and valid", async () => {
      const mockJob = { id: "5", companyId: "1" } as Job;
      vi.spyOn(AppDataSource, "getRepository").mockImplementation((entity: any) => {
        if (entity === Company) {
          return { findOne: vi.fn().mockResolvedValue(mockCompany) } as any;
        }
        if (entity === Job) {
          return { findOne: vi.fn().mockResolvedValue(mockJob) } as any;
        }
        return {} as any;
      });

      vi.spyOn(AppDataSource, "query").mockResolvedValueOnce([
        { status: "APPLIED", count: "10" },
        { status: "INTERVIEW", count: "2" },
      ]);

      const res = await request(testApp)
        .get("/api/v1/recruiter/statistics/applications-by-status?jobId=5")
        .set("Authorization", `Bearer ${recruiterToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(12);
      expect(res.body.data.byStatus.APPLIED).toBe(10);
      expect(res.body.data.byStatus.INTERVIEW).toBe(2);
    });

    it("should return 404 when jobId does not belong to company", async () => {
      vi.spyOn(AppDataSource, "getRepository").mockImplementation((entity: any) => {
        if (entity === Company) {
          return { findOne: vi.fn().mockResolvedValue(mockCompany) } as any;
        }
        if (entity === Job) {
          return { findOne: vi.fn().mockResolvedValue(null) } as any;
        }
        return {} as any;
      });

      const res = await request(testApp)
        .get("/api/v1/recruiter/statistics/applications-by-status?jobId=999")
        .set("Authorization", `Bearer ${recruiterToken()}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("Tin tuyển dụng không tồn tại");
    });
  });

  describe("GET /api/v1/recruiter/statistics/recent-jobs", () => {
    const mockCompany = {
      id: "1",
      userId: "10",
    } as unknown as Company;

    it("should return recent jobs with applicant count", async () => {
      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: vi.fn().mockResolvedValue(mockCompany),
      } as any);

      vi.spyOn(AppDataSource, "query").mockResolvedValueOnce([
        {
          id: "101",
          title: "Senior Node.js Developer",
          status: "APPROVED",
          deadline: "2026-09-30",
          createdAt: "2026-08-20T10:00:00.000Z",
          applicantCount: "18",
        },
        {
          id: "102",
          title: "Frontend React Developer",
          status: "PENDING",
          deadline: "2026-10-15",
          createdAt: "2026-08-19T08:00:00.000Z",
          applicantCount: "5",
        },
      ]);

      const res = await request(testApp)
        .get("/api/v1/recruiter/statistics/recent-jobs?limit=5")
        .set("Authorization", `Bearer ${recruiterToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toEqual({
        id: "101",
        title: "Senior Node.js Developer",
        status: "APPROVED",
        deadline: "2026-09-30",
        createdAt: "2026-08-20T10:00:00.000Z",
        applicantCount: 18,
      });
    });
  });

  describe("GET /api/v1/recruiter/statistics/candidate-trend", () => {
    const mockCompany = {
      id: "1",
      userId: "10",
    } as unknown as Company;

    it("should return candidate trend chart data with matching 2 series points", async () => {
      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: vi.fn().mockResolvedValue(mockCompany),
      } as any);

      // 1st query: currentPeriod
      // 2nd query: previousPeriod
      vi.spyOn(AppDataSource, "query")
        .mockResolvedValueOnce([
          { date: "2026-08-01", count: "3" },
          { date: "2026-08-02", count: "5" },
        ])
        .mockResolvedValueOnce([
          { date: "2026-07-29", count: "2" },
          { date: "2026-07-30", count: "4" },
        ]);

      const res = await request(testApp)
        .get("/api/v1/recruiter/statistics/candidate-trend?startDate=2026-08-01&endDate=2026-08-03")
        .set("Authorization", `Bearer ${recruiterToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.groupBy).toBe("day");
      expect(res.body.data.points).toBeInstanceOf(Array);
      expect(res.body.data.points.length).toBe(3); // 01, 02, 03

      expect(res.body.data.points[0]).toMatchObject({
        label: "01/08",
        current: 3,
        previous: 2,
        currentDate: "2026-08-01",
        prevDate: "2026-07-29",
      });

      expect(res.body.data.summary).toEqual({
        totalCurrent: 8,
        totalPrevious: 6,
        diff: 2,
      });
    });
  });
});
