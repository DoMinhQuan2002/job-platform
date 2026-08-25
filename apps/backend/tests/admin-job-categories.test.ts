/// <reference path="../src/common/types/express.d.ts" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import adminRouter from "../src/modules/admin/admin.route";
import { errorMiddleware } from "../src/common/middlewares/error.middleware";
import { AppDataSource } from "../src/data-source";
import { JobCategory } from "../src/database/entities/job-category.entity";
import { Job } from "../src/database/entities/job.entity";
import { AppError } from "../src/common/errors/app-error";
import { logService } from "../src/modules/system-logs/log.service";

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

describe("Admin Job Categories Module", () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use("/api/v1/admin", adminRouter);
  testApp.use(errorMiddleware);

  const buildCategory = (overrides: Partial<JobCategory> = {}): JobCategory =>
    ({
      id: "3",
      name: "Công nghệ thông tin",
      slug: "cong-nghe-thong-tin",
      description: null,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    }) as unknown as JobCategory;

  const mockQueryBuilder = {
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
  };

  const mockCategoryRepo = {
    createQueryBuilder: vi.fn(() => mockQueryBuilder),
    findOneBy: vi.fn(),
    create: vi.fn((data: any) => data),
    save: vi.fn(),
    remove: vi.fn(),
  };

  const mockJobRepo = {
    count: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { id: "99", role: "ADMIN", email: "admin@test.com" };
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
    mockJobRepo.count.mockResolvedValue(0);

    vi.spyOn(AppDataSource, "getRepository").mockImplementation((entity: any) => {
      if (entity === JobCategory) return mockCategoryRepo as any;
      if (entity === Job) return mockJobRepo as any;
      return {} as any;
    });

    vi.spyOn(AppDataSource, "transaction").mockImplementation(async (cb: any) => {
      return cb({ getRepository: () => mockCategoryRepo });
    });
  });

  describe("Auth & Role", () => {
    it("returns 401 when unauthenticated", async () => {
      authState.user = null;
      const res = await request(testApp).get("/api/v1/admin/job-categories");
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-ADMIN", async () => {
      authState.user = { id: "1", role: "RECRUITER", email: "rec@test.com" };
      const res = await request(testApp).get("/api/v1/admin/job-categories");
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/admin/job-categories", () => {
    it("lists categories with totalJobs", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[buildCategory()], 1]);
      mockJobRepo.count.mockResolvedValue(5);

      const res = await request(testApp).get("/api/v1/admin/job-categories");

      expect(res.status).toBe(200);
      expect(res.body.data.items[0].totalJobs).toBe(5);
    });

    it("returns 400 on invalid status filter", async () => {
      const res = await request(testApp).get("/api/v1/admin/job-categories?status=WRONG");
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/admin/job-categories/:id", () => {
    it("returns 404 when not found", async () => {
      mockCategoryRepo.findOneBy.mockResolvedValue(null);
      const res = await request(testApp).get("/api/v1/admin/job-categories/999");
      expect(res.status).toBe(404);
    });

    it("returns detail", async () => {
      mockCategoryRepo.findOneBy.mockResolvedValue(buildCategory());
      const res = await request(testApp).get("/api/v1/admin/job-categories/3");
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe("3");
    });
  });

  describe("POST /api/v1/admin/job-categories", () => {
    it("returns 400 when name too short", async () => {
      const res = await request(testApp)
        .post("/api/v1/admin/job-categories")
        .send({ name: "A" });
      expect(res.status).toBe(400);
    });

    it("returns 409 when name already exists", async () => {
      mockCategoryRepo.findOneBy.mockResolvedValue(buildCategory());
      const res = await request(testApp)
        .post("/api/v1/admin/job-categories")
        .send({ name: "Công nghệ thông tin" });
      expect(res.status).toBe(409);
    });

    it("creates category with backend-generated slug, ignores client slug", async () => {
      mockCategoryRepo.findOneBy.mockResolvedValue(null);
      mockCategoryRepo.save.mockImplementation(async (c: any) => c);

      const res = await request(testApp)
        .post("/api/v1/admin/job-categories")
        .send({ name: "Công nghệ thông tin", slug: "hacked-slug" });

      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe("cong-nghe-thong-tin");
      expect(logService.write).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "99", action: "CREATE_JOB_CATEGORY" }),
      );
    });
  });

  describe("PUT /api/v1/admin/job-categories/:id", () => {
    it("returns 404 when not found", async () => {
      mockCategoryRepo.findOneBy.mockResolvedValue(null);
      const res = await request(testApp)
        .put("/api/v1/admin/job-categories/999")
        .send({ name: "New Name" });
      expect(res.status).toBe(404);
    });

    it("regenerates slug when name changes", async () => {
      mockCategoryRepo.findOneBy
        .mockResolvedValueOnce(buildCategory())
        .mockResolvedValueOnce(null);
      mockCategoryRepo.save.mockImplementation(async (c: any) => c);

      const res = await request(testApp)
        .put("/api/v1/admin/job-categories/3")
        .send({ name: "IT và phần mềm" });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("IT và phần mềm");
      expect(res.body.data.slug).toBe("it-va-phan-mem");
      expect(logService.write).toHaveBeenCalledWith(
        expect.objectContaining({ action: "UPDATE_JOB_CATEGORY" }),
        expect.anything(),
      );
    });

    it("returns 409 when renaming to an existing name", async () => {
      mockCategoryRepo.findOneBy
        .mockResolvedValueOnce(buildCategory({ id: "3" }))
        .mockResolvedValueOnce(buildCategory({ id: "4", name: "Taken" }));

      const res = await request(testApp)
        .put("/api/v1/admin/job-categories/3")
        .send({ name: "Taken" });

      expect(res.status).toBe(409);
    });
  });

  describe("DELETE /api/v1/admin/job-categories/:id", () => {
    it("returns 404 when not found", async () => {
      mockCategoryRepo.findOneBy.mockResolvedValue(null);
      const res = await request(testApp).delete("/api/v1/admin/job-categories/999");
      expect(res.status).toBe(404);
    });

    it("returns 409 when jobs still reference the category (counts soft-deleted too)", async () => {
      mockCategoryRepo.findOneBy.mockResolvedValue(buildCategory());
      mockJobRepo.count.mockResolvedValue(2);

      const res = await request(testApp).delete("/api/v1/admin/job-categories/3");

      expect(res.status).toBe(409);
      expect(res.body.errors[0].code).toBe("CONFLICT");
      expect(mockJobRepo.count).toHaveBeenCalledWith(
        expect.objectContaining({ withDeleted: true }),
      );
    });

    it("hard-deletes when no job references exist", async () => {
      mockCategoryRepo.findOneBy.mockResolvedValue(buildCategory());
      mockJobRepo.count.mockResolvedValue(0);

      const res = await request(testApp).delete("/api/v1/admin/job-categories/3");

      expect(res.status).toBe(200);
      expect(res.body.data).toBeNull();
      expect(mockCategoryRepo.remove).toHaveBeenCalled();
      expect(logService.write).toHaveBeenCalledWith(
        expect.objectContaining({ action: "DELETE_JOB_CATEGORY" }),
      );
    });
  });
});
