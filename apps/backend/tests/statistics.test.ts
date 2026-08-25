/// <reference path="../src/common/types/express.d.ts" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import statisticsRouter from "../src/modules/statistics/statistics.route";
import { errorMiddleware } from "../src/common/middlewares/error.middleware";
import { AppDataSource } from "../src/data-source";
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

describe("Statistics Module", () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use("/api/v1/admin/statistics", statisticsRouter);
  testApp.use(errorMiddleware);

  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(testApp).get("/api/v1/admin/statistics");
    expect(res.status).toBe(401);
  });

  it("returns 403 for a non-ADMIN authenticated user", async () => {
    authState.user = { id: "1", role: "RECRUITER", email: "rec@test.com" };
    const res = await request(testApp).get("/api/v1/admin/statistics");
    expect(res.status).toBe(403);
  });

  it("returns 5 numeric fields from a single query", async () => {
    authState.user = { id: "99", role: "ADMIN", email: "admin@test.com" };

    const querySpy = vi.spyOn(AppDataSource, "query").mockResolvedValue([
      {
        totalCandidates: "186",
        totalRecruiters: "34",
        totalCompanies: "30",
        totalJobs: "210",
        totalApplications: "892",
      },
    ]);

    const res = await request(testApp).get("/api/v1/admin/statistics");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      totalCandidates: 186,
      totalRecruiters: 34,
      totalCompanies: 30,
      totalJobs: 210,
      totalApplications: 892,
    });
    expect(querySpy).toHaveBeenCalledTimes(1);
  });
});
