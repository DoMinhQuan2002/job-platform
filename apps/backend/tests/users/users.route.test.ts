/// <reference path="../../src/common/types/express.d.ts" />
import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import { AppError } from "../../src/common/errors/app-error";
import usersRouter from "../../src/modules/users/users.route";
import { usersController } from "../../src/modules/users/users.controller";
import { errorMiddleware } from "../../src/common/middlewares/error.middleware";

const authState = vi.hoisted(() => ({ authenticated: true }));

vi.mock("../../src/common/middlewares/authenticate.middleware", () => ({
  authenticate: (req: any, _res: any, next: any) => {
    if (!authState.authenticated) return next(new AppError(401, "UNAUTHORIZED", "Token không hợp lệ"));
    req.user = { id: "10", email: "test@test.com", role: "CANDIDATE" };
    next();
  },
}));

vi.mock("../../src/modules/users/users.controller", () => ({
  usersController: {
    getMe: vi.fn((_req, res) => res.status(200).json({ handler: "getMe" })),
    updateMe: vi.fn((_req, res) => res.status(200).json({ handler: "updateMe" })),
    uploadAvatar: vi.fn((req, res) => res.status(200).json({ handler: "uploadAvatar", file: req.file?.fieldname })),
    deleteAvatar: vi.fn((_req, res) => res.status(200).json({ handler: "deleteAvatar" })),
    changePassword: vi.fn((_req, res) => res.status(200).json({ handler: "changePassword" })),
  },
}));

describe("Users routes", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/users", usersRouter);
  app.use(errorMiddleware);

  beforeEach(() => {
    vi.clearAllMocks();
    authState.authenticated = true;
  });

  it.each([
    ["get", "/api/v1/users/me", "getMe"],
    ["patch", "/api/v1/users/me", "updateMe"],
    ["delete", "/api/v1/users/me/avatar", "deleteAvatar"],
    ["patch", "/api/v1/users/me/password", "changePassword"],
  ] as const)("maps %s %s to %s", async (method, url, handler) => {
    const response = await request(app)[method](url).send({});
    expect(response.status).toBe(200);
    expect(response.body.handler).toBe(handler);
  });

  it("maps avatar multipart field to uploadAvatar", async () => {
    const response = await request(app).post("/api/v1/users/me/avatar")
      .attach("avatar", Buffer.from("image"), { filename: "avatar.png", contentType: "image/png" });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: "uploadAvatar", file: "avatar" });
    expect(usersController.uploadAvatar).toHaveBeenCalledOnce();
  });

  it("protects every route with authenticate", async () => {
    authState.authenticated = false;
    const responses = await Promise.all([
      request(app).get("/api/v1/users/me"),
      request(app).patch("/api/v1/users/me").send({}),
      request(app).post("/api/v1/users/me/avatar"),
      request(app).delete("/api/v1/users/me/avatar"),
      request(app).patch("/api/v1/users/me/password").send({}),
    ]);
    expect(responses.every((response) => response.status === 401)).toBe(true);
    expect(usersController.getMe).not.toHaveBeenCalled();
  });
});
