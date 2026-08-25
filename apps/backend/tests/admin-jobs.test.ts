/// <reference path="../src/common/types/express.d.ts" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import adminRouter from "../src/modules/admin/admin.route";
import { errorMiddleware } from "../src/common/middlewares/error.middleware";
import { AppDataSource } from "../src/data-source";
import { Job } from "../src/database/entities/job.entity";
import { JOB_STATUS } from "../src/common/constants/job";
import { AppError } from "../src/common/errors/app-error";
import { logService } from "../src/modules/system-logs/log.service";
import { notificationService } from "../src/modules/notifications/notification.service";

const authState = vi.hoisted(() => ({
  user: null as null | { id: string; role: "CANDIDATE" | "RECRUITER" | "ADMIN"; email: string },
}));

vi.mock("../src/common/middlewares/authenticate.middleware", () => ({
  authenticate: (req: any, _res: any, next: any) => {
    if (!authState.user) {
      next(new AppError(401, "UNAUTHORIZED", "Access token không hợp lệ hoặc đã hết hạn"));
      return;
    }
    req.user = authState.user;
    next();
  },
}));

vi.mock("../src/modules/system-logs/log.service", () => ({
  logService: { write: vi.fn().mockResolvedValue({ id: "log_1" }) },
}));

vi.mock("../src/modules/notifications/notification.service", () => ({
  notificationService: { create: vi.fn().mockResolvedValue({ id: "notif_1" }) },
}));

describe("Admin Jobs Module", () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use("/api/v1/admin", adminRouter);
  testApp.use(errorMiddleware);

  const company = { id: "5", name: "ACME Corp", userId: "50" };
  const category = { id: "2", name: "Backend" };

  const buildJob = (overrides: Partial<Job> = {}): Job =>
    ({
      id: "10",
      title: "Backend Engineer",
      slug: "backend-engineer",
      company,
      category,
      jobType: "FULL_TIME",
      jobMode: "ONSITE",
      salaryMin: "15000000.00",
      salaryMax: "25000000.00",
      isNegotiable: false,
      quantity: 1,
      deadline: new Date("2027-01-01"),
      status: JOB_STATUS.PENDING,
      rejectReason: null,
      description: "desc",
      requirements: "req",
      benefits: null,
      address: "123 Main St",
      experience: 2,
      jobSkills: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    }) as unknown as Job;

  const mockQueryBuilder = {
    innerJoinAndSelect: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
  };

  const mockJobRepo = {
    createQueryBuilder: vi.fn(() => mockQueryBuilder),
    findOne: vi.fn(),
    save: vi.fn(),
    softDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    vi.spyOn(AppDataSource, "getRepository").mockImplementation((entity: any) => {
      if (entity === Job) return mockJobRepo as any;
      return {} as any;
    });

    vi.spyOn(AppDataSource, "transaction").mockImplementation(async (cb: any) => {
      return cb({ getRepository: () => mockJobRepo });
    });
  });

  describe("Auth & Role", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await request(testApp).get("/api/v1/admin/jobs");
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-ADMIN", async () => {
      authState.user = { id: "1", role: "RECRUITER", email: "rec@test.com" };
      const res = await request(testApp).get("/api/v1/admin/jobs");
      expect(res.status).toBe(403);
    });
  });

  describe("With Mock Admin User", () => {
    beforeEach(() => {
      authState.user = { id: "99", role: "ADMIN", email: "admin@test.com" };
    });

    describe("GET /api/v1/admin/jobs", () => {
      it("lists jobs with company and category", async () => {
        mockQueryBuilder.getManyAndCount.mockResolvedValue([[buildJob()], 1]);

        const res = await request(testApp).get("/api/v1/admin/jobs");

        expect(res.status).toBe(200);
        expect(res.body.data.items[0].company).toEqual({ id: "5", name: "ACME Corp" });
        expect(res.body.data.items[0].category).toEqual(category);
      });

      it("applies status, companyId, categoryId filters", async () => {
        await request(testApp).get("/api/v1/admin/jobs?status=PENDING&companyId=5&categoryId=2");

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("job.status = :status", {
          status: "PENDING",
        });
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("job.companyId = :companyId", {
          companyId: "5",
        });
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("job.categoryId = :categoryId", {
          categoryId: "2",
        });
      });

      it("returns 400 on invalid status filter", async () => {
        const res = await request(testApp).get("/api/v1/admin/jobs?status=NOT_A_STATUS");
        expect(res.status).toBe(400);
      });
    });

    describe("GET /api/v1/admin/jobs/:id", () => {
      it("returns 404 when job not found", async () => {
        mockJobRepo.findOne.mockResolvedValue(null);
        const res = await request(testApp).get("/api/v1/admin/jobs/999");
        expect(res.status).toBe(404);
      });

      it("returns detail with mapped skills", async () => {
        mockJobRepo.findOne.mockResolvedValue(
          buildJob({
            jobSkills: [
              { isRequired: true, skill: { id: "7", name: "React" } },
              { isRequired: false, skill: { id: "8", name: "Docker" } },
            ] as any,
          }),
        );

        const res = await request(testApp).get("/api/v1/admin/jobs/10");

        expect(res.status).toBe(200);
        expect(res.body.data.skills).toEqual([
          { id: "7", name: "React", isRequired: true },
          { id: "8", name: "Docker", isRequired: false },
        ]);
      });
    });

    describe("PUT /api/v1/admin/jobs/:id/approve", () => {
      it("returns 404 when job not found", async () => {
        mockJobRepo.findOne.mockResolvedValue(null);
        const res = await request(testApp).put("/api/v1/admin/jobs/999/approve");
        expect(res.status).toBe(404);
      });

      it("returns 409 when job is not PENDING", async () => {
        mockJobRepo.findOne.mockResolvedValue(buildJob({ status: JOB_STATUS.APPROVED }));
        const res = await request(testApp).put("/api/v1/admin/jobs/10/approve");
        expect(res.status).toBe(409);
        expect(res.body.errors[0].code).toBe("CONFLICT");
      });

      it("approves PENDING job, logs and notifies recruiter", async () => {
        mockJobRepo.findOne.mockResolvedValue(buildJob({ status: JOB_STATUS.PENDING }));
        mockJobRepo.save.mockImplementation(async (j: Job) => j);

        const res = await request(testApp).put("/api/v1/admin/jobs/10/approve");

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe(JOB_STATUS.APPROVED);
        expect(logService.write).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: "99",
            action: "APPROVE_JOB",
            target: { type: "JOB", id: "10" },
            oldValue: JOB_STATUS.PENDING,
            newValue: JOB_STATUS.APPROVED,
          }),
          expect.anything(),
        );
        expect(notificationService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: "50",
            type: "JOB_APPROVED",
            params: { jobTitle: "Backend Engineer" },
          }),
          expect.anything(),
        );
      });
    });

    describe("PUT /api/v1/admin/jobs/:id/reject", () => {
      it("returns 400 when reason missing", async () => {
        const res = await request(testApp).put("/api/v1/admin/jobs/10/reject").send({});
        expect(res.status).toBe(400);
      });

      it("returns 409 when job is not PENDING", async () => {
        mockJobRepo.findOne.mockResolvedValue(buildJob({ status: JOB_STATUS.CLOSED }));
        const res = await request(testApp)
          .put("/api/v1/admin/jobs/10/reject")
          .send({ reason: "Noi dung khong phu hop quy dinh" });
        expect(res.status).toBe(409);
      });

      it("rejects PENDING job with reason, logs description and notifies with reason", async () => {
        mockJobRepo.findOne.mockResolvedValue(buildJob({ status: JOB_STATUS.PENDING }));
        mockJobRepo.save.mockImplementation(async (j: Job) => j);

        const res = await request(testApp)
          .put("/api/v1/admin/jobs/10/reject")
          .send({ reason: "Noi dung khong phu hop quy dinh" });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe(JOB_STATUS.REJECTED);
        expect(res.body.data.rejectReason).toBe("Noi dung khong phu hop quy dinh");
        expect(logService.write).toHaveBeenCalledWith(
          expect.objectContaining({
            action: "REJECT_JOB",
            description: "Noi dung khong phu hop quy dinh",
          }),
          expect.anything(),
        );
        expect(notificationService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "JOB_REJECTED",
            params: { jobTitle: "Backend Engineer", reason: "Noi dung khong phu hop quy dinh" },
          }),
          expect.anything(),
        );
      });
    });

    describe("DELETE /api/v1/admin/jobs/:id", () => {
      it("returns 400 when reason missing", async () => {
        const res = await request(testApp).delete("/api/v1/admin/jobs/10").send({});
        expect(res.status).toBe(400);
      });

      it("returns 404 when job not found", async () => {
        mockJobRepo.findOne.mockResolvedValue(null);
        const res = await request(testApp)
          .delete("/api/v1/admin/jobs/999")
          .send({ reason: "Vi pham dieu khoan su dung dich vu" });
        expect(res.status).toBe(404);
      });

      it("soft-deletes job regardless of status (no 409 guard)", async () => {
        mockJobRepo.findOne.mockResolvedValue(buildJob({ status: JOB_STATUS.APPROVED }));

        const res = await request(testApp)
          .delete("/api/v1/admin/jobs/10")
          .send({ reason: "Vi pham dieu khoan su dung dich vu" });

        expect(res.status).toBe(200);
        expect(res.body.data).toBeNull();
        expect(mockJobRepo.softDelete).toHaveBeenCalledWith("10");
        expect(logService.write).toHaveBeenCalledWith(
          expect.objectContaining({
            action: "DELETE_JOB",
            oldValue: JOB_STATUS.APPROVED,
            newValue: null,
            description: "Vi pham dieu khoan su dung dich vu",
          }),
          expect.anything(),
        );
        expect(notificationService.create).toHaveBeenCalledWith(
          expect.objectContaining({ type: "JOB_DELETED" }),
          expect.anything(),
        );
      });
    });
  });
});
