/// <reference path="../src/common/types/express.d.ts" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { In } from "typeorm";
import notificationsRouter from "../src/modules/notifications/notifications.route";
import { errorMiddleware } from "../src/common/middlewares/error.middleware";
import { AppDataSource } from "../src/data-source";
import { NotificationEntity } from "../src/database/entities/notification.entity";
import { ApplicationEntity } from "../src/database/entities/application.entity";
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

describe("Notifications Module", () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use("/api/v1/notifications", notificationsRouter);
  testApp.use(errorMiddleware);

  const mockRepo = {
    findAndCount: vi.fn(),
    count: vi.fn(),
    findOneBy: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  const mockApplicationRepo = {
    findOne: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;

    vi.spyOn(AppDataSource, "getRepository").mockImplementation((entity: any) => {
      if (entity === NotificationEntity) return mockRepo as any;
      if (entity === ApplicationEntity) return mockApplicationRepo as any;
      return {} as any;
    });
  });

  describe("Auth", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await request(testApp).get("/api/v1/notifications");
      expect(res.status).toBe(401);
      expect(res.body.errors[0].code).toBe("UNAUTHORIZED");
    });
  });

  describe("With Mock Candidate User", () => {
    beforeEach(() => {
      authState.user = { id: "user_1", role: "CANDIDATE", email: "cand@test.com" };
    });

    describe("GET /api/v1/notifications", () => {
      it("lists notifications with pagination", async () => {
        mockRepo.findAndCount.mockResolvedValue([
          [{ id: "1", userId: "user_1", type: "JOB_APPROVED", isRead: false }],
          1,
        ]);

        const res = await request(testApp).get("/api/v1/notifications");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.items).toHaveLength(1);
        expect(res.body.data.pagination).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
        expect(mockRepo.findAndCount).toHaveBeenCalledWith(
          expect.objectContaining({ where: { userId: "user_1" } }),
        );
      });

      it("filters by isRead and type query params", async () => {
        mockRepo.findAndCount.mockResolvedValue([[], 0]);

        const res = await request(testApp).get(
          "/api/v1/notifications?isRead=true&type=JOB_APPROVED",
        );

        expect(res.status).toBe(200);
        expect(mockRepo.findAndCount).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { userId: "user_1", isRead: true, type: In(["JOB_APPROVED"]) },
          }),
        );
      });

      it("accepts multiple type values (comma-separated) to group tabs on the FE", async () => {
        mockRepo.findAndCount.mockResolvedValue([[], 0]);

        const res = await request(testApp).get(
          "/api/v1/notifications?type=JOB_APPROVED,JOB_REJECTED",
        );

        expect(res.status).toBe(200);
        expect(mockRepo.findAndCount).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { userId: "user_1", type: In(["JOB_APPROVED", "JOB_REJECTED"]) },
          }),
        );
      });

      it("filters by from/to date range", async () => {
        mockRepo.findAndCount.mockResolvedValue([[], 0]);

        const res = await request(testApp).get(
          "/api/v1/notifications?from=2026-01-01&to=2026-01-31",
        );

        expect(res.status).toBe(200);
        const call = mockRepo.findAndCount.mock.calls[0][0];
        expect(call.where.userId).toBe("user_1");
        expect(call.where.createdAt).toBeDefined();
      });

      it("returns 400 when from is after to", async () => {
        const res = await request(testApp).get(
          "/api/v1/notifications?from=2026-02-01&to=2026-01-01",
        );

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("VALIDATION_ERROR");
      });

      it("returns 400 on invalid type filter", async () => {
        const res = await request(testApp).get("/api/v1/notifications?type=NOT_A_TYPE");

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("VALIDATION_ERROR");
      });

      it("returns 400 when page is not a number", async () => {
        const res = await request(testApp).get("/api/v1/notifications?page=abc");

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("VALIDATION_ERROR");
      });
    });

    describe("GET /api/v1/notifications/unread-count", () => {
      it("returns unread count for current user", async () => {
        mockRepo.count.mockResolvedValue(3);

        const res = await request(testApp).get("/api/v1/notifications/unread-count");

        expect(res.status).toBe(200);
        expect(res.body.data.unreadCount).toBe(3);
        expect(mockRepo.count).toHaveBeenCalledWith({
          where: { userId: "user_1", isRead: false },
        });
      });
    });

    describe("GET /api/v1/notifications/:id", () => {
      it("returns 404 when notification not found or not owned", async () => {
        mockRepo.findOneBy.mockResolvedValue(null);

        const res = await request(testApp).get("/api/v1/notifications/999");

        expect(res.status).toBe(404);
        expect(res.body.errors[0].code).toBe("NOT_FOUND");
        expect(mockApplicationRepo.findOne).not.toHaveBeenCalled();
      });

      it("returns job = null for a type without a linked application (e.g. JOB_APPROVED)", async () => {
        mockRepo.findOneBy.mockResolvedValue({
          id: "1",
          userId: "user_1",
          type: "JOB_APPROVED",
          targetType: "JOB",
          targetId: "10",
        });

        const res = await request(testApp).get("/api/v1/notifications/1");

        expect(res.status).toBe(200);
        expect(res.body.data.job).toBeNull();
        expect(mockApplicationRepo.findOne).not.toHaveBeenCalled();
      });

      it("joins job/company info for APPLICATION_STATUS_CHANGED", async () => {
        mockRepo.findOneBy.mockResolvedValue({
          id: "1",
          userId: "user_1",
          type: "APPLICATION_STATUS_CHANGED",
          targetType: "APPLICATION",
          targetId: "50",
        });
        mockApplicationRepo.findOne.mockResolvedValue({
          id: "50",
          status: "INTERVIEW",
          job: {
            id: "10",
            title: "Chuyên viên Digital Marketing",
            slug: "chuyen-vien-digital-marketing",
            address: "Hà Nội",
            jobType: "FULL_TIME",
            jobMode: "ONSITE",
            salaryMin: "15000000",
            salaryMax: "25000000",
            isNegotiable: false,
            company: { id: "5", name: "Công ty Cổ phần FPT", logo: null },
          },
        });

        const res = await request(testApp).get("/api/v1/notifications/1");

        expect(res.status).toBe(200);
        expect(res.body.data.job).toEqual({
          id: "10",
          title: "Chuyên viên Digital Marketing",
          slug: "chuyen-vien-digital-marketing",
          address: "Hà Nội",
          jobType: "FULL_TIME",
          jobMode: "ONSITE",
          salaryMin: "15000000",
          salaryMax: "25000000",
          isNegotiable: false,
          company: { id: "5", name: "Công ty Cổ phần FPT", logo: null },
          applicationId: "50",
          applicationStatus: "INTERVIEW",
        });
        expect(mockApplicationRepo.findOne).toHaveBeenCalledWith(
          expect.objectContaining({ where: { id: "50" } }),
        );
      });

      it("returns job = null when the linked application no longer exists", async () => {
        mockRepo.findOneBy.mockResolvedValue({
          id: "1",
          userId: "user_1",
          type: "APPLICATION_STATUS_CHANGED",
          targetType: "APPLICATION",
          targetId: "50",
        });
        mockApplicationRepo.findOne.mockResolvedValue(null);

        const res = await request(testApp).get("/api/v1/notifications/1");

        expect(res.status).toBe(200);
        expect(res.body.data.job).toBeNull();
      });

      it("is not swallowed by /unread-count (route ordering)", async () => {
        mockRepo.count.mockResolvedValue(2);

        const res = await request(testApp).get("/api/v1/notifications/unread-count");

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty("unreadCount");
        expect(mockRepo.findOneBy).not.toHaveBeenCalled();
      });
    });

    describe("PATCH /api/v1/notifications/:id/read", () => {
      it("returns 404 when notification not found or not owned", async () => {
        mockRepo.findOneBy.mockResolvedValue(null);

        const res = await request(testApp).patch("/api/v1/notifications/999/read");

        expect(res.status).toBe(404);
        expect(res.body.errors[0].code).toBe("NOT_FOUND");
      });

      it("marks notification as read", async () => {
        const notification = { id: "1", userId: "user_1", isRead: false, readAt: null };
        mockRepo.findOneBy.mockResolvedValue(notification);
        mockRepo.save.mockImplementation(async (n) => n);

        const res = await request(testApp).patch("/api/v1/notifications/1/read");

        expect(res.status).toBe(200);
        expect(res.body.data.isRead).toBe(true);
        expect(mockRepo.save).toHaveBeenCalled();
      });

      it("is idempotent when notification already read (no save call)", async () => {
        const notification = { id: "1", userId: "user_1", isRead: true, readAt: new Date() };
        mockRepo.findOneBy.mockResolvedValue(notification);

        const res = await request(testApp).patch("/api/v1/notifications/1/read");

        expect(res.status).toBe(200);
        expect(mockRepo.save).not.toHaveBeenCalled();
      });
    });

    describe("PATCH /api/v1/notifications/read-all", () => {
      it("marks all unread notifications as read and returns updatedCount", async () => {
        mockRepo.update.mockResolvedValue({ affected: 5 });

        const res = await request(testApp).patch("/api/v1/notifications/read-all");

        expect(res.status).toBe(200);
        expect(res.body.data.updatedCount).toBe(5);
        expect(mockRepo.update).toHaveBeenCalledWith(
          { userId: "user_1", isRead: false },
          expect.objectContaining({ isRead: true }),
        );
      });

      it("is not swallowed by the /:id/read route (route ordering)", async () => {
        mockRepo.update.mockResolvedValue({ affected: 0 });

        const res = await request(testApp).patch("/api/v1/notifications/read-all");

        // Neu route bi khai sai thu tu, "read-all" se bi hieu la :id -> goi nham markRead
        // va tra ve 404 NOT_FOUND thay vi chay markAllRead.
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty("updatedCount");
      });
    });

    describe("DELETE /api/v1/notifications/:id", () => {
      it("returns 404 when notification not found or not owned", async () => {
        mockRepo.findOneBy.mockResolvedValue(null);

        const res = await request(testApp).delete("/api/v1/notifications/999");

        expect(res.status).toBe(404);
        expect(res.body.errors[0].code).toBe("NOT_FOUND");
      });

      it("deletes notification owned by current user", async () => {
        mockRepo.findOneBy.mockResolvedValue({ id: "1", userId: "user_1" });

        const res = await request(testApp).delete("/api/v1/notifications/1");

        expect(res.status).toBe(200);
        expect(res.body.data).toBeNull();
        expect(mockRepo.remove).toHaveBeenCalled();
      });
    });
  });

  describe("Cross-user isolation", () => {
    it("scopes queries to req.user.id, not a client-supplied value", async () => {
      authState.user = { id: "user_2", role: "CANDIDATE", email: "other@test.com" };
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      await request(testApp).get("/api/v1/notifications");

      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: "user_2" } }),
      );
    });
  });
});
