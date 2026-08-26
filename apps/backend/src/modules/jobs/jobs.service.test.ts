import { describe, expect, it, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { AppDataSource } from "../../data-source";
import { Job } from "../../database/entities/job.entity";
import { jobService } from "./jobs.service";
import { jobsController } from "./jobs.controller";
import jobsRouter from "./jobs.route";
import { errorMiddleware } from "../../common/middlewares/error.middleware";
import { JOB_STATUS } from "../../common/constants/job";

describe("Jobs Module - Public Query", () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use("/api/v1/jobs", jobsRouter);
  testApp.use(errorMiddleware);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("jobService.getJobs", () => {
    it("should filter by companyId when companyId is provided in query", async () => {
      const mockJobs = [
        {
          id: "101",
          companyId: "5",
          title: "Senior NodeJS Developer",
          status: JOB_STATUS.APPROVED,
          company: { id: "5", name: "FPT Software" },
          category: { id: "2", name: "IT - Software" },
          jobSkills: [],
        },
      ];

      const qbMock: any = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([mockJobs, 1]),
      };

      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        createQueryBuilder: vi.fn().mockReturnValue(qbMock),
      } as any);

      const result = await jobService.getJobs({ companyId: "5", page: 1, size: 20 });

      expect(qbMock.where).toHaveBeenCalledWith("job.status = :status", { status: JOB_STATUS.APPROVED });
      expect(qbMock.andWhere).toHaveBeenCalledWith("job.deadline >= CURRENT_DATE");
      expect(qbMock.andWhere).toHaveBeenCalledWith("job.companyId = :companyId", { companyId: "5" });
      expect(result.items).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 1,
        size: 20,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe("GET /api/v1/jobs (HTTP Endpoint)", () => {
    it("should accept companyId query param and return filtered jobs", async () => {
      const mockResult = {
        items: [
          {
            id: "101",
            companyId: "5",
            title: "Senior NodeJS Developer",
            status: "APPROVED",
            company: { id: "5", name: "FPT Software" },
          },
        ],
        pagination: { page: 1, size: 20, total: 1, totalPages: 1 },
      };

      vi.spyOn(jobService, "getJobs").mockResolvedValue(mockResult as any);

      const res = await request(testApp).get("/api/v1/jobs?companyId=5");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockResult.items,
        pagination: mockResult.pagination,
      });
      expect(jobService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: "5" })
      );
    });

    it("should accept alias company and limit query params", async () => {
      const mockResult = {
        items: [],
        pagination: { page: 1, size: 10, total: 0, totalPages: 0 },
      };

      vi.spyOn(jobService, "getJobs").mockResolvedValue(mockResult as any);

      const res = await request(testApp).get("/api/v1/jobs?company=5&limit=10");

      expect(res.status).toBe(200);
      expect(jobService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: "5", size: 10 })
      );
    });

    it("should return 400 when companyId is not a valid positive integer string", async () => {
      const res = await request(testApp).get("/api/v1/jobs?companyId=invalid");

      expect(res.status).toBe(400);
      expect(res.body.errors[0].code).toBe("INVALID_ID");
    });
  });
});
