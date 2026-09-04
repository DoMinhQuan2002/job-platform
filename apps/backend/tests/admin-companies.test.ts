/// <reference path="../src/common/types/express.d.ts" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import adminRouter from "../src/modules/admin/admin.route";
import { errorMiddleware } from "../src/common/middlewares/error.middleware";
import { AppDataSource } from "../src/data-source";
import { Company } from "../src/database/entities/company.entity";
import { Job } from "../src/database/entities/job.entity";
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

describe("Admin Companies Module", () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use("/api/v1/admin", adminRouter);
  testApp.use(errorMiddleware);

  const owner = { id: "50", fullName: "Recruiter Owner", email: "owner@test.com" };

  const buildCompany = (overrides: Partial<Company> = {}): Company =>
    ({
      id: "5",
      userId: "50",
      user: owner,
      name: "ACME Corp",
      slug: "acme-corp",
      logo: null,
      website: null,
      email: "contact@acme.com",
      phone: "0123456789",
      taxCode: null,
      companySize: null,
      address: "123 Main St",
      description: null,
      rejectReason: null,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      jobs: [],
      ...overrides,
    }) as unknown as Company;

  const mockQueryBuilder = {
    innerJoinAndSelect: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
  };

  const mockJobCountQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    getRawMany: vi.fn().mockResolvedValue([]),
  };

  const mockCompanyStatsQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    setParameters: vi.fn().mockReturnThis(),
    getRawOne: vi.fn().mockResolvedValue({
      total: "1",
      active: "1",
      blocked: "0",
      newThisMonth: "1",
    }),
  };

  const mockCompanyRepo = {
    createQueryBuilder: vi.fn((alias?: string) =>
      alias === "statsCompany" ? mockCompanyStatsQueryBuilder : mockQueryBuilder,
    ),
    findOne: vi.fn(),
    save: vi.fn(),
  };

  const mockJobRepo = {
    createQueryBuilder: vi.fn(() => mockJobCountQueryBuilder),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
    mockJobCountQueryBuilder.getRawMany.mockResolvedValue([]);
    mockCompanyStatsQueryBuilder.getRawOne.mockResolvedValue({
      total: "0",
      active: "0",
      blocked: "0",
      newThisMonth: "0",
    });

    vi.spyOn(AppDataSource, "getRepository").mockImplementation((entity: any) => {
      if (entity === Company) return mockCompanyRepo as any;
      if (entity === Job) return mockJobRepo as any;
      return {} as any;
    });

    vi.spyOn(AppDataSource, "transaction").mockImplementation(async (cb: any) => {
      return cb({ getRepository: () => mockCompanyRepo });
    });
  });

  describe("Auth & Role", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await request(testApp).get("/api/v1/admin/companies");
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-ADMIN", async () => {
      authState.user = { id: "1", role: "RECRUITER", email: "rec@test.com" };
      const res = await request(testApp).get("/api/v1/admin/companies");
      expect(res.status).toBe(403);
    });
  });

  describe("With Mock Admin User", () => {
    beforeEach(() => {
      authState.user = { id: "99", role: "ADMIN", email: "admin@test.com" };
    });

    describe("GET /api/v1/admin/companies", () => {
      it("lists companies with owner and totalJobs", async () => {
        mockQueryBuilder.getManyAndCount.mockResolvedValue([[buildCompany()], 1]);
        mockJobCountQueryBuilder.getRawMany.mockResolvedValue([{ companyId: "5", count: "3" }]);
        mockCompanyStatsQueryBuilder.getRawOne.mockResolvedValue({
          total: "12",
          active: "9",
          blocked: "2",
          newThisMonth: "4",
        });

        const res = await request(testApp).get("/api/v1/admin/companies");

        expect(res.status).toBe(200);
        expect(res.body.data.items[0].owner).toEqual(owner);
        expect(res.body.data.items[0].totalJobs).toBe(3);
        expect(res.body.data.stats).toEqual({
          total: 12,
          active: 9,
          blocked: 2,
          newThisMonth: 4,
        });
      });

      it("defaults totalJobs to 0 when company has no jobs", async () => {
        mockQueryBuilder.getManyAndCount.mockResolvedValue([[buildCompany()], 1]);
        mockJobCountQueryBuilder.getRawMany.mockResolvedValue([]);

        const res = await request(testApp).get("/api/v1/admin/companies");

        expect(res.body.data.items[0].totalJobs).toBe(0);
      });

      it("job count query excludes soft-deleted jobs", async () => {
        mockQueryBuilder.getManyAndCount.mockResolvedValue([[buildCompany()], 1]);

        await request(testApp).get("/api/v1/admin/companies");

        expect(mockJobCountQueryBuilder.andWhere).toHaveBeenCalledWith("job.deletedAt IS NULL");
      });

      it("applies search and status filters", async () => {
        await request(testApp).get("/api/v1/admin/companies?search=acme&status=BLOCKED");

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          expect.stringContaining("ILIKE"),
          { search: "%acme%" },
        );
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("company.status = :status", {
          status: "BLOCKED",
        });
      });

      it("applies created date range filters", async () => {
        await request(testApp).get(
          "/api/v1/admin/companies?createdFrom=2026-08-01&createdTo=2026-08-31",
        );

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          "company.createdAt >= :createdFrom",
          { createdFrom: new Date("2026-08-01T00:00:00.000Z") },
        );
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          "company.createdAt <= :createdTo",
          { createdTo: new Date("2026-08-31T23:59:59.999Z") },
        );
      });

      it("returns 400 when createdFrom is after createdTo", async () => {
        const res = await request(testApp).get(
          "/api/v1/admin/companies?createdFrom=2026-09-01&createdTo=2026-08-31",
        );

        expect(res.status).toBe(400);
      });

      it("returns 400 on invalid status filter", async () => {
        const res = await request(testApp).get("/api/v1/admin/companies?status=NOT_A_STATUS");
        expect(res.status).toBe(400);
      });
    });

    describe("GET /api/v1/admin/companies/:id", () => {
      it("returns 404 when company not found", async () => {
        mockCompanyRepo.findOne.mockResolvedValue(null);

        const res = await request(testApp).get("/api/v1/admin/companies/999");

        expect(res.status).toBe(404);
        expect(res.body.errors[0].code).toBe("NOT_FOUND");
      });

      it("returns company detail with website and description", async () => {
        mockCompanyRepo.findOne.mockResolvedValue(
          buildCompany({ website: "https://acme.com", description: "A company" }),
        );

        const res = await request(testApp).get("/api/v1/admin/companies/5");

        expect(res.status).toBe(200);
        expect(res.body.data.website).toBe("https://acme.com");
        expect(res.body.data.description).toBe("A company");
      });
    });

    describe("PUT /api/v1/admin/companies/:id/status", () => {
      it("returns 400 when reason missing for BLOCKED", async () => {
        const res = await request(testApp)
          .put("/api/v1/admin/companies/5/status")
          .send({ status: "BLOCKED" });

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("VALIDATION_ERROR");
      });

      it("returns 409 when company is still PENDING (must go through approve/reject)", async () => {
        mockCompanyRepo.findOne.mockResolvedValue(buildCompany({ status: "PENDING" }));

        const res = await request(testApp)
          .put("/api/v1/admin/companies/5/status")
          .send({ status: "BLOCKED", reason: "Vi phạm điều khoản sử dụng" });

        expect(res.status).toBe(409);
        expect(res.body.errors[0].code).toBe("CONFLICT");
      });

      it("returns 409 when company is REJECTED (must be resubmitted, not locked)", async () => {
        mockCompanyRepo.findOne.mockResolvedValue(buildCompany({ status: "REJECTED" }));

        const res = await request(testApp)
          .put("/api/v1/admin/companies/5/status")
          .send({ status: "ACTIVE" });

        expect(res.status).toBe(409);
        expect(res.body.errors[0].code).toBe("CONFLICT");
      });

      it("returns 404 when company not found", async () => {
        mockCompanyRepo.findOne.mockResolvedValue(null);

        const res = await request(testApp)
          .put("/api/v1/admin/companies/999/status")
          .send({ status: "BLOCKED", reason: "Vi phạm điều khoản sử dụng" });

        expect(res.status).toBe(404);
      });

      it("returns 409 when company already at target status", async () => {
        mockCompanyRepo.findOne.mockResolvedValue(buildCompany({ status: "ACTIVE" }));

        const res = await request(testApp)
          .put("/api/v1/admin/companies/5/status")
          .send({ status: "ACTIVE" });

        expect(res.status).toBe(409);
        expect(res.body.errors[0].code).toBe("CONFLICT");
      });

      it("locks company: updates status, logs, notifies owner with companyName param", async () => {
        mockCompanyRepo.findOne.mockResolvedValue(buildCompany({ status: "ACTIVE" }));
        mockCompanyRepo.save.mockImplementation(async (c: Company) => c);

        const res = await request(testApp)
          .put("/api/v1/admin/companies/5/status")
          .send({ status: "BLOCKED", reason: "Vi phạm điều khoản sử dụng" });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("BLOCKED");
        expect(logService.write).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: "99",
            action: "LOCK_COMPANY",
            target: { type: "COMPANY", id: "5" },
            oldValue: "ACTIVE",
            newValue: "BLOCKED",
            description: "Vi phạm điều khoản sử dụng",
          }),
          expect.anything(),
        );
        expect(notificationService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: "50",
            type: "COMPANY_LOCKED",
            target: { type: "COMPANY", id: "5" },
            params: { companyName: "ACME Corp" },
          }),
          expect.anything(),
        );
      });

      it("unlocks company: no description, notifies with COMPANY_UNLOCKED", async () => {
        mockCompanyRepo.findOne.mockResolvedValue(buildCompany({ status: "BLOCKED" }));
        mockCompanyRepo.save.mockImplementation(async (c: Company) => c);

        const res = await request(testApp)
          .put("/api/v1/admin/companies/5/status")
          .send({ status: "ACTIVE" });

        expect(res.status).toBe(200);
        expect(logService.write).toHaveBeenCalledWith(
          expect.objectContaining({ action: "UNLOCK_COMPANY", description: null }),
          expect.anything(),
        );
        expect(notificationService.create).toHaveBeenCalledWith(
          expect.objectContaining({ type: "COMPANY_UNLOCKED" }),
          expect.anything(),
        );
      });
    });

    describe("PUT /api/v1/admin/companies/:id/approve", () => {
      it("returns 404 when company not found", async () => {
        mockCompanyRepo.findOne.mockResolvedValue(null);

        const res = await request(testApp).put("/api/v1/admin/companies/999/approve");

        expect(res.status).toBe(404);
      });

      it("returns 409 when company is not PENDING", async () => {
        mockCompanyRepo.findOne.mockResolvedValue(buildCompany({ status: "ACTIVE" }));

        const res = await request(testApp).put("/api/v1/admin/companies/5/approve");

        expect(res.status).toBe(409);
        expect(res.body.errors[0].code).toBe("CONFLICT");
      });

      it("approves PENDING company, logs and notifies owner", async () => {
        mockCompanyRepo.findOne.mockResolvedValue(buildCompany({ status: "PENDING" }));
        mockCompanyRepo.save.mockImplementation(async (c: Company) => c);

        const res = await request(testApp).put("/api/v1/admin/companies/5/approve");

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("ACTIVE");
        expect(logService.write).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: "99",
            action: "APPROVE_COMPANY",
            target: { type: "COMPANY", id: "5" },
            oldValue: "PENDING",
            newValue: "ACTIVE",
          }),
          expect.anything(),
        );
        expect(notificationService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: "50",
            type: "COMPANY_APPROVED",
            params: { companyName: "ACME Corp" },
          }),
          expect.anything(),
        );
      });
    });

    describe("PUT /api/v1/admin/companies/:id/reject", () => {
      it("returns 400 when reason missing", async () => {
        const res = await request(testApp).put("/api/v1/admin/companies/5/reject").send({});
        expect(res.status).toBe(400);
      });

      it("returns 409 when company is not PENDING", async () => {
        mockCompanyRepo.findOne.mockResolvedValue(buildCompany({ status: "BLOCKED" }));

        const res = await request(testApp)
          .put("/api/v1/admin/companies/5/reject")
          .send({ reason: "Thiếu giấy phép kinh doanh hợp lệ" });

        expect(res.status).toBe(409);
      });

      it("rejects PENDING company with reason, logs description and notifies with reason", async () => {
        mockCompanyRepo.findOne.mockResolvedValue(buildCompany({ status: "PENDING" }));
        mockCompanyRepo.save.mockImplementation(async (c: Company) => c);

        const res = await request(testApp)
          .put("/api/v1/admin/companies/5/reject")
          .send({ reason: "Thiếu giấy phép kinh doanh hợp lệ" });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("REJECTED");
        expect(res.body.data.rejectReason).toBe("Thiếu giấy phép kinh doanh hợp lệ");
        expect(logService.write).toHaveBeenCalledWith(
          expect.objectContaining({
            action: "REJECT_COMPANY",
            oldValue: "PENDING",
            newValue: "REJECTED",
            description: "Thiếu giấy phép kinh doanh hợp lệ",
          }),
          expect.anything(),
        );
        expect(notificationService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "COMPANY_REJECTED",
            params: { companyName: "ACME Corp", reason: "Thiếu giấy phép kinh doanh hợp lệ" },
          }),
          expect.anything(),
        );
      });
    });
  });
});
