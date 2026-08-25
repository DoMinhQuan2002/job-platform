import type { Request, Response } from "express";
import { parseChangeMyPasswordDto } from "./dto/change-my-password.dto";
import { parseUpdateMyProfileDto } from "./dto/update-my-profile.dto";
import { usersService } from "./users.service";

export const usersController = {
  getMe: async (req: Request, res: Response) => {
    const data = await usersService.getMyProfile(req.user!.id);
    res.status(200).json({ success: true, message: "Lấy thông tin cá nhân thành công", data });
  },
  updateMe: async (req: Request, res: Response) => {
    const data = await usersService.updateMyProfile(req.user!.id, parseUpdateMyProfileDto(req.body));
    res.status(200).json({ success: true, message: "Cập nhật thông tin cá nhân thành công", data });
  },
  uploadAvatar: async (req: Request, res: Response) => {
    const data = await usersService.uploadMyAvatar(req.user!.id, req.file);
    res.status(200).json({ success: true, message: "Cập nhật avatar thành công", data });
  },
  deleteAvatar: async (req: Request, res: Response) => {
    const data = await usersService.deleteMyAvatar(req.user!.id);
    res.status(200).json({ success: true, message: "Xóa avatar thành công", data });
  },
  changePassword: async (req: Request, res: Response) => {
    await usersService.changeMyPassword(req.user!.id, parseChangeMyPasswordDto(req.body));
    res.status(200).json({ success: true, message: "Đổi mật khẩu thành công", data: null });
  },
};
