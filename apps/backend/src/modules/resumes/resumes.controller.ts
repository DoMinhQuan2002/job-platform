import { Request, Response } from "express";

export const resumesController = {
  // TODO: GET /me — Lấy danh sách CV (chưa bị soft-delete)
  getMyResumes: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: getMyResumes" });
  },

  // TODO: POST /me/upload — Upload file CV lên Supabase Storage
  // Middleware multer sẽ được gắn ở đây (memoryStorage)
  upload: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: upload resume" });
  },

  // TODO: PATCH /me/:id/set-default — Đặt CV làm mặc định (transaction)
  setDefault: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: setDefault resume" });
  },

  // TODO: DELETE /me/:id — Soft-delete CV (kiểm tra đang dùng trong applications không)
  remove: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: remove resume" });
  },
};
