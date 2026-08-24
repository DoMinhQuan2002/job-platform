import { Request, Response } from "express";

export const candidateProfilesController = {
  // TODO: GET /me — Lấy toàn bộ hồ sơ ứng viên đang đăng nhập
  getMyProfile: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: getMyProfile" });
  },

  // TODO: PATCH /me — Cập nhật bio, career_objective
  updateMyProfile: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: updateMyProfile" });
  },
};
