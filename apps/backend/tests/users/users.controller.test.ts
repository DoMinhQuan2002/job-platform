/// <reference path="../../src/common/types/express.d.ts" />
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { usersController } from "../../src/modules/users/users.controller";
import { usersService } from "../../src/modules/users/users.service";

vi.mock("../../src/modules/users/users.service", () => ({
  usersService: {
    getMyProfile: vi.fn(), updateMyProfile: vi.fn(), uploadMyAvatar: vi.fn(),
    deleteMyAvatar: vi.fn(), changeMyPassword: vi.fn(),
  },
}));

describe("UsersController", () => {
  type MockRequest = Request & { file?: { originalname: string } };
  const req = { user: { id: "10", email: "test@test.com", role: "CANDIDATE" }, body: {}, file: undefined } as unknown as MockRequest;
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

  beforeEach(() => {
    vi.clearAllMocks();
    req.body = {};
    req.file = undefined;
  });

  it("getMe returns profile with status 200", async () => {
    vi.mocked(usersService.getMyProfile).mockResolvedValue({ id: "10" } as any);
    await usersController.getMe(req, res);
    expect(usersService.getMyProfile).toHaveBeenCalledWith("10");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: { id: "10" } }));
  });

  it("updateMe validates body and returns updated profile", async () => {
    req.body = { fullName: "New Name" };
    vi.mocked(usersService.updateMyProfile).mockResolvedValue({ fullName: "New Name" } as any);
    await usersController.updateMe(req, res);
    expect(usersService.updateMyProfile).toHaveBeenCalledWith("10", { fullName: "New Name" });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("uploadAvatar passes multer file to service", async () => {
    req.file = { originalname: "avatar.png" };
    vi.mocked(usersService.uploadMyAvatar).mockResolvedValue({ avatar: "https://avatar" });
    await usersController.uploadAvatar(req, res);
    expect(usersService.uploadMyAvatar).toHaveBeenCalledWith("10", req.file);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("deleteAvatar returns avatar null", async () => {
    vi.mocked(usersService.deleteMyAvatar).mockResolvedValue({ avatar: null });
    await usersController.deleteAvatar(req, res);
    expect(usersService.deleteMyAvatar).toHaveBeenCalledWith("10");
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { avatar: null } }));
  });

  it("changePassword returns data null", async () => {
    req.body = { currentPassword: "Current@123", newPassword: "NewPassword@123" };
    vi.mocked(usersService.changeMyPassword).mockResolvedValue(undefined);
    await usersController.changePassword(req, res);
    expect(usersService.changeMyPassword).toHaveBeenCalledWith("10", req.body);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
  });
});
