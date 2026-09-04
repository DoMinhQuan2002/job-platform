/// <reference path="../src/common/types/express.d.ts" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import adminRouter from "../src/modules/admin/admin.route";
import { errorMiddleware } from "../src/common/middlewares/error.middleware";
import { AppDataSource } from "../src/data-source";
import { UserEntity, UserStatus } from "../src/database/entities/user.entity";
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

describe("Admin Users Module", () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use("/api/v1/admin", adminRouter);
  testApp.use(errorMiddleware);

  const adminRole = { id: "3", name: "ADMIN" };
  const candidateRole = { id: "1", name: "CANDIDATE" };

  const buildUser = (overrides: Partial<UserEntity> = {}): UserEntity =>
    ({
      id: "10",
      email: "user10@test.com",
      fullName: "User Ten",
      phone: null,
      avatar: null,
      role: candidateRole,
      status: UserStatus.ACTIVE,
      lastLoginAt: null,
      emailVerifiedAt: new Date(),
      dateOfBirth: null,
      addressDetail: null,
      wardCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    }) as UserEntity;

  const mockQueryBuilder = {
    innerJoinAndSelect: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
  };

  const mockUserRepo = {
    createQueryBuilder: vi.fn(() => mockQueryBuilder),
    findOne: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    vi.spyOn(AppDataSource, "getRepository").mockImplementation((entity: any) => {
      if (entity === UserEntity) return mockUserRepo as any;
      return {} as any;
    });

    vi.spyOn(AppDataSource, "transaction").mockImplementation(async (cb: any) => {
      return cb({ getRepository: () => mockUserRepo });
    });
  });

  describe("Auth & Role", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await request(testApp).get("/api/v1/admin/users");
      expect(res.status).toBe(401);
      expect(res.body.errors[0].code).toBe("UNAUTHORIZED");
    });

    it("returns 403 for a non-ADMIN authenticated user", async () => {
      authState.user = { id: "1", role: "CANDIDATE", email: "cand@test.com" };

      const res = await request(testApp).get("/api/v1/admin/users");

      expect(res.status).toBe(403);
      expect(res.body.errors[0].code).toBe("FORBIDDEN");
    });
  });

  describe("With Mock Admin User", () => {
    beforeEach(() => {
      authState.user = { id: "99", role: "ADMIN", email: "admin@test.com" };
    });

    describe("GET /api/v1/admin/users", () => {
      it("lists users with pagination", async () => {
        mockQueryBuilder.getManyAndCount.mockResolvedValue([[buildUser()], 1]);

        const res = await request(testApp).get("/api/v1/admin/users");

        expect(res.status).toBe(200);
        expect(res.body.data.items).toHaveLength(1);
        expect(res.body.data.items[0].role).toEqual(candidateRole);
        expect(res.body.data.pagination).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
      });

      it("applies search filter on email/fullName", async () => {
        await request(testApp).get("/api/v1/admin/users?search=abc");

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          expect.stringContaining("ILIKE"),
          { search: "%abc%" },
        );
      });

      it("applies role and status filters", async () => {
        await request(testApp).get("/api/v1/admin/users?role=RECRUITER&status=BANNED");

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("role.name = :role", {
          role: "RECRUITER",
        });
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("user.status = :status", {
          status: "BANNED",
        });
      });

      it("returns 400 on invalid role filter", async () => {
        const res = await request(testApp).get("/api/v1/admin/users?role=NOT_A_ROLE");

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("VALIDATION_ERROR");
      });

      it("returns 400 when page is not a number", async () => {
        const res = await request(testApp).get("/api/v1/admin/users?page=abc");

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("VALIDATION_ERROR");
      });
    });

    describe("GET /api/v1/admin/users/:id", () => {
      it("returns 404 when user not found", async () => {
        mockUserRepo.findOne.mockResolvedValue(null);

        const res = await request(testApp).get("/api/v1/admin/users/999");

        expect(res.status).toBe(404);
        expect(res.body.errors[0].code).toBe("NOT_FOUND");
      });

      it("returns user detail with extra profile fields and resolved address", async () => {
        mockUserRepo.findOne.mockResolvedValue(
          buildUser({ addressDetail: "123 Main St", wardCode: "00004" }),
        );
        vi.spyOn(AppDataSource, "query").mockResolvedValueOnce([
          { ward_name: "Phường Ba Đình", province_name: "Thành phố Hà Nội" },
        ]);

        const res = await request(testApp).get("/api/v1/admin/users/10");

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe("10");
        expect(res.body.data.addressDetail).toBe("123 Main St");
        expect(res.body.data.wardCode).toBe("00004");
        expect(res.body.data.wardName).toBe("Phường Ba Đình");
        expect(res.body.data.provinceName).toBe("Thành phố Hà Nội");
        expect(res.body.data.fullAddress).toBe("123 Main St, Phường Ba Đình, Thành phố Hà Nội");
      });
    });

    describe("PUT /api/v1/admin/users/:id/status", () => {
      it("returns 400 when reason missing for BANNED", async () => {
        const res = await request(testApp)
          .put("/api/v1/admin/users/10/status")
          .send({ status: "BANNED" });

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("VALIDATION_ERROR");
      });

      it("returns 400 when reason too short", async () => {
        const res = await request(testApp)
          .put("/api/v1/admin/users/10/status")
          .send({ status: "BANNED", reason: "short" });

        expect(res.status).toBe(400);
      });

      it("returns 403 when admin tries to lock their own account", async () => {
        const res = await request(testApp)
          .put("/api/v1/admin/users/99/status")
          .send({ status: "BANNED", reason: "Vi phạm điều khoản sử dụng" });

        expect(res.status).toBe(403);
        expect(res.body.errors[0].code).toBe("FORBIDDEN");
      });

      it("allows admin to unlock their own account", async () => {
        mockUserRepo.findOne.mockResolvedValue(
          buildUser({ id: "99", status: UserStatus.BANNED }),
        );
        mockUserRepo.save.mockImplementation(async (u: UserEntity) => u);

        const res = await request(testApp)
          .put("/api/v1/admin/users/99/status")
          .send({ status: "ACTIVE" });

        expect(res.status).toBe(200);
      });

      it("returns 404 when target user not found", async () => {
        mockUserRepo.findOne.mockResolvedValue(null);

        const res = await request(testApp)
          .put("/api/v1/admin/users/999/status")
          .send({ status: "BANNED", reason: "Vi phạm điều khoản sử dụng" });

        expect(res.status).toBe(404);
        expect(res.body.errors[0].code).toBe("NOT_FOUND");
      });

      it("returns 409 when user already at target status", async () => {
        mockUserRepo.findOne.mockResolvedValue(buildUser({ status: UserStatus.ACTIVE }));

        const res = await request(testApp)
          .put("/api/v1/admin/users/10/status")
          .send({ status: "ACTIVE" });

        expect(res.status).toBe(409);
        expect(res.body.errors[0].code).toBe("CONFLICT");
      });

      it("locks account: updates status, writes log with reason, notifies without reason", async () => {
        mockUserRepo.findOne.mockResolvedValue(buildUser({ status: UserStatus.ACTIVE }));
        mockUserRepo.save.mockImplementation(async (u: UserEntity) => u);

        const res = await request(testApp)
          .put("/api/v1/admin/users/10/status")
          .send({ status: "BANNED", reason: "Vi phạm điều khoản sử dụng" });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("BANNED");
        expect(logService.write).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: "99",
            action: "LOCK_USER",
            target: { type: "USER", id: "10" },
            oldValue: UserStatus.ACTIVE,
            newValue: "BANNED",
            description: "Vi phạm điều khoản sử dụng",
          }),
          expect.anything(),
        );
        expect(notificationService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: "10",
            type: "ACCOUNT_LOCKED",
            target: { type: "USER", id: "10" },
          }),
          expect.anything(),
        );
      });

      it("unlocks account: writes log without description", async () => {
        mockUserRepo.findOne.mockResolvedValue(buildUser({ status: UserStatus.BANNED }));
        mockUserRepo.save.mockImplementation(async (u: UserEntity) => u);

        const res = await request(testApp)
          .put("/api/v1/admin/users/10/status")
          .send({ status: "ACTIVE" });

        expect(res.status).toBe(200);
        expect(logService.write).toHaveBeenCalledWith(
          expect.objectContaining({ action: "UNLOCK_USER", description: null }),
          expect.anything(),
        );
        expect(notificationService.create).toHaveBeenCalledWith(
          expect.objectContaining({ type: "ACCOUNT_UNLOCKED" }),
          expect.anything(),
        );
      });
    });
  });
});
