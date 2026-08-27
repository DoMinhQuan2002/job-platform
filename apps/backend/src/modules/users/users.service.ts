import { AppError } from "@/common/errors/app-error";
import { ASSET_TYPE, storageService, validateUpload } from "@/common/storage";
import { hashPassword, verifyPassword } from "@/common/security/password";
import { AppDataSource } from "@/data-source";
import { SessionEntity, UserEntity } from "@/database/entities";
import type { ChangeMyPasswordDto } from "./dto/change-my-password.dto";
import type { UpdateMyProfileDto } from "./dto/update-my-profile.dto";

export const usersService = {

  async getMyProfile(userId: string) {
    const user = await AppDataSource.getRepository(UserEntity).findOne({ where: { id: userId }, relations: { role: true } });
    if (!user) throw new AppError(404, "USER_NOT_FOUND", "Không tìm thấy tài khoản");
    const avatar = !user.avatar || /^https?:\/\//i.test(user.avatar) ? user.avatar : (await storageService.getAccessUrl(user.avatar, ASSET_TYPE.USER_AVATAR)).url;
    return { id: user.id, roleId: user.roleId || user.role.id, role: user.role.name, email: user.email, fullName: user.fullName, phone: user.phone, avatar, dateOfBirth: user.dateOfBirth, addressDetail: user.addressDetail, wardCode: user.wardCode, lastLoginAt: user.lastLoginAt, emailVerifiedAt: user.emailVerifiedAt };
  },

  async updateMyProfile(userId: string, input: UpdateMyProfileDto) {
    if (Object.prototype.hasOwnProperty.call(input, "wardCode") && input.wardCode) {
      const rows = await AppDataSource.query("SELECT 1 FROM wards WHERE code = $1 LIMIT 1", [input.wardCode]);
      if (!Array.isArray(rows) || !rows.length) throw new AppError(404, "WARD_NOT_FOUND", "wardCode không tồn tại");
    }
    const user = await AppDataSource.getRepository(UserEntity).findOne({ where: { id: userId }, relations: { role: true } });
    if (!user) throw new AppError(404, "USER_NOT_FOUND", "Không tìm thấy tài khoản");
    if (Object.prototype.hasOwnProperty.call(input, "fullName")) user.fullName = input.fullName!;
    if (Object.prototype.hasOwnProperty.call(input, "phone")) user.phone = input.phone!;
    if (Object.prototype.hasOwnProperty.call(input, "dateOfBirth")) user.dateOfBirth = input.dateOfBirth!;
    if (Object.prototype.hasOwnProperty.call(input, "addressDetail")) user.addressDetail = input.addressDetail!;
    if (Object.prototype.hasOwnProperty.call(input, "wardCode")) user.wardCode = input.wardCode!;
    await AppDataSource.getRepository(UserEntity).save(user);
    return this.getMyProfile(userId);
  },

  // 
  async uploadMyAvatar(userId: string, file: Express.Multer.File | undefined) {
    if (!file) throw new AppError(400, "AVATAR_REQUIRED", "Cần gửi file avatar");
    validateUpload({ assetType: ASSET_TYPE.USER_AVATAR, mimeType: file.mimetype, size: file.size });
    const user = await AppDataSource.getRepository(UserEntity).findOne({ where: { id: userId } });
    if (!user) throw new AppError(404, "USER_NOT_FOUND", "Không tìm thấy tài khoản");
    const oldAvatar = user.avatar;
    const stored = await storageService.upload({ assetType: ASSET_TYPE.USER_AVATAR, fileName: file.originalname, mimeType: file.mimetype, buffer: file.buffer });
    user.avatar = stored.storagePath;
    await AppDataSource.getRepository(UserEntity).save(user);
    if (oldAvatar && !/^https?:\/\//i.test(oldAvatar)) await storageService.remove(oldAvatar, ASSET_TYPE.USER_AVATAR);
    return { avatar: stored.publicUrl };
  },


  async deleteMyAvatar(userId: string) {
    const user = await AppDataSource.getRepository(UserEntity).findOne({ where: { id: userId } });
    if (!user) throw new AppError(404, "USER_NOT_FOUND", "Không tìm thấy tài khoản");
    const oldAvatar = user.avatar; user.avatar = null;
    await AppDataSource.getRepository(UserEntity).save(user);
    if (oldAvatar && !/^https?:\/\//i.test(oldAvatar)) await storageService.remove(oldAvatar, ASSET_TYPE.USER_AVATAR);
    return { avatar: null };
  },


  async changeMyPassword(userId: string, input: ChangeMyPasswordDto) {
    const user = await AppDataSource.getRepository(UserEntity).findOne({ where: { id: userId } });
    if (!user) throw new AppError(404, "USER_NOT_FOUND", "Không tìm thấy tài khoản");
    if (!user.passwordHash) throw new AppError(400, "OAUTH_PASSWORD_UNAVAILABLE", "Tài khoản OAuth chưa có mật khẩu");
    if (!(await verifyPassword(input.currentPassword, user.passwordHash))) throw new AppError(400, "CURRENT_PASSWORD_INCORRECT", "Mật khẩu hiện tại không đúng");
    await AppDataSource.transaction(async (manager) => {
      await manager.update(UserEntity, { id: userId }, { passwordHash: await hashPassword(input.newPassword) });
      await manager.createQueryBuilder().update(SessionEntity).set({ isRevoked: true }).where("user_id = :userId AND is_revoked = false", { userId }).execute();
    });
  },
};
