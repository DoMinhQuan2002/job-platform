import { beforeEach, describe, expect, it, vi } from "vitest";
import { usersService } from "../../src/modules/users/users.service";
import { AppDataSource } from "../../src/data-source";
import { UserEntity, UserStatus } from "../../src/database/entities/user.entity";
import { storageService, validateUpload } from "../../src/common/storage";
import { hashPassword, verifyPassword } from "../../src/common/security/password";

vi.mock("../../src/common/storage", () => ({
  ASSET_TYPE: { USER_AVATAR: "user_avatar" },
  validateUpload: vi.fn(),
  storageService: { upload: vi.fn(), remove: vi.fn(), getAccessUrl: vi.fn() },
}));

vi.mock("../../src/common/security/password", () => ({
  verifyPassword: vi.fn(), hashPassword: vi.fn(),
}));

describe("UsersService", () => {
  const role = { id: "1", name: "CANDIDATE" };
  const buildUser = (overrides: Partial<UserEntity> = {}) => ({
    id: "10", role, roleId: "1", email: "candidate@test.com", passwordHash: "old-hash",
    fullName: "Candidate Test", phone: null, avatar: null, dateOfBirth: null,
    addressDetail: null, wardCode: null, status: UserStatus.ACTIVE,
    createdAt: new Date("2026-08-01T00:00:00.000Z"), updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    lastLoginAt: null, emailVerifiedAt: new Date("2026-08-01T00:00:00.000Z"), deletedAt: null,
    ...overrides,
  }) as UserEntity;
  const userRepo = { findOne: vi.fn(), save: vi.fn() };
  const sessionQuery = { update: vi.fn().mockReturnThis(), set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), execute: vi.fn() };
  const manager = { update: vi.fn(), createQueryBuilder: vi.fn(() => sessionQuery) };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AppDataSource, "getRepository").mockReturnValue(userRepo as any);
    vi.spyOn(AppDataSource, "query").mockResolvedValue([{ exists: 1 }]);
    vi.spyOn(AppDataSource, "transaction").mockImplementation(async (callback: any) => callback(manager));
    userRepo.save.mockImplementation(async (user: UserEntity) => user);
    vi.mocked(storageService.upload).mockResolvedValue({ assetType: "user_avatar", bucket: "public", storagePath: "avatars/new.png", fileName: "avatar.png", mimeType: "image/png", size: 8, isPublic: true, publicUrl: "https://storage/new.png" });
    vi.mocked(storageService.remove).mockResolvedValue(undefined);
    vi.mocked(storageService.getAccessUrl).mockResolvedValue({ url: "https://storage/old.png", expiresIn: null, isPublic: true });
    vi.mocked(verifyPassword).mockResolvedValue(true);
    vi.mocked(hashPassword).mockResolvedValue("new-hash");
    sessionQuery.execute.mockResolvedValue({ affected: 1 });
  });

  it("gets profile without exposing password hash", async () => {
    userRepo.findOne.mockResolvedValue(buildUser({ avatar: "avatars/old.png" }));
    const result = await usersService.getMyProfile("10");
    expect(result).toMatchObject({ id: "10", roleId: "1", avatar: "https://storage/old.png" });
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("throws USER_NOT_FOUND when profile does not exist", async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(usersService.getMyProfile("10")).rejects.toMatchObject({ statusCode: 404, code: "USER_NOT_FOUND" });
  });

  it("uses role.id when relation id is unavailable and keeps an external avatar URL", async () => {
    userRepo.findOne.mockResolvedValue(buildUser({ roleId: undefined as unknown as string, avatar: "https://cdn.test/avatar.png" }));
    const result = await usersService.getMyProfile("10");
    expect(result).toMatchObject({ roleId: "1", avatar: "https://cdn.test/avatar.png" });
    expect(storageService.getAccessUrl).not.toHaveBeenCalled();
  });

  it("checks ward existence and updates only provided fields", async () => {
    const user = buildUser();
    userRepo.findOne.mockResolvedValue(user);
    const result = await usersService.updateMyProfile("10", { fullName: "New Name", wardCode: "00001" });
    expect(AppDataSource.query).toHaveBeenCalledWith(expect.stringContaining("FROM wards"), ["00001"]);
    expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({ fullName: "New Name", wardCode: "00001" }));
    expect(result.fullName).toBe("New Name");
  });

  it("throws WARD_NOT_FOUND for unknown ward", async () => {
    vi.mocked(AppDataSource.query).mockResolvedValue([]);
    await expect(usersService.updateMyProfile("10", { wardCode: "99999" })).rejects.toMatchObject({ statusCode: 404, code: "WARD_NOT_FOUND" });
  });

  it("updates nullable fields without querying wards", async () => {
    const user = buildUser({ phone: "0901234567", dateOfBirth: "2000-01-01", addressDetail: "Old", wardCode: "00001" });
    userRepo.findOne.mockResolvedValue(user);
    await usersService.updateMyProfile("10", {
      phone: null, dateOfBirth: null, addressDetail: null, wardCode: null,
    });
    expect(AppDataSource.query).not.toHaveBeenCalled();
    expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      phone: null, dateOfBirth: null, addressDetail: null, wardCode: null,
    }));
  });

  it("updates profile successfully when wardCode is omitted", async () => {
    const user = buildUser();
    userRepo.findOne.mockResolvedValue(user);
    const result = await usersService.updateMyProfile("10", { fullName: "Name Without Ward" });
    expect(AppDataSource.query).not.toHaveBeenCalled();
    expect(result.fullName).toBe("Name Without Ward");
  });

  it("throws USER_NOT_FOUND when updating a missing user", async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(usersService.updateMyProfile("10", { fullName: "New Name" }))
      .rejects.toMatchObject({ statusCode: 404, code: "USER_NOT_FOUND" });
  });

  it("uploads avatar and removes previous stored object", async () => {
    const user = buildUser({ avatar: "avatars/old.png" });
    userRepo.findOne.mockResolvedValue(user);
    const file = { originalname: "avatar.png", mimetype: "image/png", size: 8, buffer: Buffer.from("image") };
    const result = await usersService.uploadMyAvatar("10", file);
    expect(validateUpload).toHaveBeenCalledWith({ assetType: "user_avatar", mimeType: "image/png", size: 8 });
    expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({ avatar: "avatars/new.png" }));
    expect(storageService.remove).toHaveBeenCalledWith("avatars/old.png", "user_avatar");
    expect(result).toEqual({ avatar: "https://storage/new.png" });
  });

  it("requires an avatar file", async () => {
    await expect(usersService.uploadMyAvatar("10", undefined)).rejects.toMatchObject({ statusCode: 400, code: "AVATAR_REQUIRED" });
  });

  it("throws USER_NOT_FOUND before uploading for a missing user", async () => {
    userRepo.findOne.mockResolvedValue(null);
    const file = { originalname: "avatar.png", mimetype: "image/png", size: 8, buffer: Buffer.from("image") };
    await expect(usersService.uploadMyAvatar("10", file))
      .rejects.toMatchObject({ statusCode: 404, code: "USER_NOT_FOUND" });
    expect(storageService.upload).not.toHaveBeenCalled();
  });

  it("uploads avatar without removing storage when there is no old avatar", async () => {
    userRepo.findOne.mockResolvedValue(buildUser({ avatar: null }));
    const file = { originalname: "avatar.png", mimetype: "image/png", size: 8, buffer: Buffer.from("image") };
    await usersService.uploadMyAvatar("10", file);
    expect(storageService.remove).not.toHaveBeenCalled();
  });

  it("does not remove an old external avatar URL from storage", async () => {
    userRepo.findOne.mockResolvedValue(buildUser({ avatar: "https://cdn.test/old.png" }));
    const file = { originalname: "avatar.png", mimetype: "image/png", size: 8, buffer: Buffer.from("image") };
    await usersService.uploadMyAvatar("10", file);
    expect(storageService.remove).not.toHaveBeenCalled();
  });

  it("deletes avatar and is idempotent without an old object", async () => {
    userRepo.findOne.mockResolvedValue(buildUser({ avatar: null }));
    await expect(usersService.deleteMyAvatar("10")).resolves.toEqual({ avatar: null });
    expect(storageService.remove).not.toHaveBeenCalled();
  });

  it("deletes the old avatar object from storage", async () => {
    userRepo.findOne.mockResolvedValue(buildUser({ avatar: "avatars/old.png" }));
    await expect(usersService.deleteMyAvatar("10")).resolves.toEqual({ avatar: null });
    expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({ avatar: null }));
    expect(storageService.remove).toHaveBeenCalledWith("avatars/old.png", "user_avatar");
  });

  it("does not remove an external avatar URL from storage", async () => {
    userRepo.findOne.mockResolvedValue(buildUser({ avatar: "https://cdn.test/old.png" }));
    await usersService.deleteMyAvatar("10");
    expect(storageService.remove).not.toHaveBeenCalled();
  });

  it("throws USER_NOT_FOUND when deleting avatar for a missing user", async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(usersService.deleteMyAvatar("10"))
      .rejects.toMatchObject({ statusCode: 404, code: "USER_NOT_FOUND" });
  });

  it("rejects an incorrect current password", async () => {
    userRepo.findOne.mockResolvedValue(buildUser());
    vi.mocked(verifyPassword).mockResolvedValue(false);
    await expect(usersService.changeMyPassword("10", { currentPassword: "Wrong@123", newPassword: "NewPassword@123" })).rejects.toMatchObject({ code: "CURRENT_PASSWORD_INCORRECT" });
  });

  it("throws USER_NOT_FOUND when changing password for a missing user", async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(usersService.changeMyPassword("10", { currentPassword: "Current@123", newPassword: "NewPassword@123" }))
      .rejects.toMatchObject({ statusCode: 404, code: "USER_NOT_FOUND" });
  });

  it("rejects password change for an OAuth-only account", async () => {
    userRepo.findOne.mockResolvedValue(buildUser({ passwordHash: null }));
    await expect(usersService.changeMyPassword("10", { currentPassword: "Current@123", newPassword: "NewPassword@123" }))
      .rejects.toMatchObject({ statusCode: 400, code: "OAUTH_PASSWORD_UNAVAILABLE" });
    expect(verifyPassword).not.toHaveBeenCalled();
  });

  it("hashes and updates the new password", async () => {
    userRepo.findOne.mockResolvedValue(buildUser());
    await usersService.changeMyPassword("10", { currentPassword: "Current@123", newPassword: "NewPassword@123" });
    expect(hashPassword).toHaveBeenCalledWith("NewPassword@123");
    expect(manager.update).toHaveBeenCalledWith(UserEntity, { id: "10" }, { passwordHash: "new-hash" });
  });
});
