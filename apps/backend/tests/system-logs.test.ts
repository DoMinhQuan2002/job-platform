/// <reference path="../src/common/types/express.d.ts" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import systemLogsRouter from "../src/modules/system-logs/system-logs.route";
import { errorMiddleware } from "../src/common/middlewares/error.middleware";
import { AppDataSource } from "../src/data-source";
import { SystemLogEntity } from "../src/database/entities/system-log.entity";
import { AppError } from "../src/common/errors/app-error";

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

describe("System Logs Module", () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use("/api/v1/admin/system-logs", systemLogsRouter);
  testApp.use(errorMiddleware);

  const mockRepo = {
    findAndCount: vi.fn(),
    findOneBy: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;

    vi.spyOn(AppDataSource, "getRepository").mockImplementation((entity: any) => {
      if (entity === SystemLogEntity) return mockRepo as any;
      return {} as any;
    });
    // enrich() dung raw SQL cho fetchUsers/fetchTargetLabels - mac dinh tra rong,
    // tung test tu override khi can kiem tra gia tri join.
    vi.spyOn(AppDataSource, "query").mockResolvedValue([]);
  });

  describe("Auth & Role", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await request(testApp).get("/api/v1/admin/system-logs");
      expect(res.status).toBe(401);
      expect(res.body.errors[0].code).toBe("UNAUTHORIZED");
    });

    it("returns 403 for a non-ADMIN authenticated user", async () => {
      authState.user = { id: "user_1", role: "CANDIDATE", email: "cand@test.com" };

      const res = await request(testApp).get("/api/v1/admin/system-logs");

      expect(res.status).toBe(403);
      expect(res.body.errors[0].code).toBe("FORBIDDEN");
    });
  });

  describe("With Mock Admin User", () => {
    beforeEach(() => {
      authState.user = { id: "admin_1", role: "ADMIN", email: "admin@test.com" };
    });

    describe("GET /api/v1/admin/system-logs", () => {
      it("lists logs with pagination", async () => {
        mockRepo.findAndCount.mockResolvedValue([
          [
            {
              id: "1",
              userId: "user_1",
              action: "LOCK_USER",
              targetType: "USER",
              targetId: "5",
            },
          ],
          1,
        ]);

        const res = await request(testApp).get("/api/v1/admin/system-logs");

        expect(res.status).toBe(200);
        expect(res.body.data.items).toHaveLength(1);
        expect(res.body.data.pagination).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
      });

      it("does not leak raw userId, exposes joined user object instead", async () => {
        mockRepo.findAndCount.mockResolvedValue([
          [{ id: "1", userId: "user_1", action: "LOCK_USER", targetType: null, targetId: null }],
          1,
        ]);
        vi.spyOn(AppDataSource, "query").mockResolvedValueOnce([
          { id: "user_1", fullName: "Nguyen Van A", email: "a@test.com" },
        ]);

        const res = await request(testApp).get("/api/v1/admin/system-logs");

        const item = res.body.data.items[0];
        expect(item.userId).toBeUndefined();
        expect(item.user).toEqual({ id: "user_1", fullName: "Nguyen Van A", email: "a@test.com" });
      });

      it("resolves targetLabel via joined table lookup", async () => {
        mockRepo.findAndCount.mockResolvedValue([
          [
            {
              id: "1",
              userId: null,
              action: "LOCK_COMPANY",
              targetType: "COMPANY",
              targetId: "9",
            },
          ],
          1,
        ]);
        vi.spyOn(AppDataSource, "query").mockImplementation((sql: string) => {
          if (sql.includes("FROM companies")) return Promise.resolve([{ id: "9", label: "ACME Corp" }]);
          return Promise.resolve([]);
        });

        const res = await request(testApp).get("/api/v1/admin/system-logs");

        expect(res.body.data.items[0].targetLabel).toBe("ACME Corp");
      });

      it("returns 400 on invalid action filter", async () => {
        const res = await request(testApp).get("/api/v1/admin/system-logs?action=NOT_A_REAL_ACTION");

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("VALIDATION_ERROR");
      });

      it("returns 400 when targetId given without targetType", async () => {
        const res = await request(testApp).get("/api/v1/admin/system-logs?targetId=5");

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("VALIDATION_ERROR");
      });

      it("returns 400 when fromDate is after toDate", async () => {
        const res = await request(testApp).get(
          "/api/v1/admin/system-logs?fromDate=2026-08-20&toDate=2026-08-01",
        );

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("VALIDATION_ERROR");
      });

      it("rejects a SQL-injection-shaped targetType before it reaches raw SQL", async () => {
        const res = await request(testApp).get(
          "/api/v1/admin/system-logs?targetType=USER%3B%20DROP%20TABLE%20users%3B--&targetId=1",
        );

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("VALIDATION_ERROR");
      });
    });

    describe("GET /api/v1/admin/system-logs/:id", () => {
      it("returns 404 when log not found", async () => {
        mockRepo.findOneBy.mockResolvedValue(null);

        const res = await request(testApp).get("/api/v1/admin/system-logs/999");

        expect(res.status).toBe(404);
        expect(res.body.errors[0].code).toBe("NOT_FOUND");
      });

      it("returns log detail", async () => {
        mockRepo.findOneBy.mockResolvedValue({
          id: "1",
          userId: null,
          action: "DELETE_JOB_CATEGORY",
          targetType: null,
          targetId: null,
        });

        const res = await request(testApp).get("/api/v1/admin/system-logs/1");

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe("1");
      });
    });
  });
});
