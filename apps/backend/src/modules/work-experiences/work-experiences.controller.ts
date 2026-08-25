import { Request, Response } from "express";

export const workExperiencesController = {
  // TODO: POST / — Thêm kinh nghiệm làm việc
  create: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: create work experience" });
  },

  // TODO: PUT /:id — Sửa kinh nghiệm (validate ownership: candidate_id)
  update: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: update work experience" });
  },

  // TODO: DELETE /:id — Xóa kinh nghiệm (validate ownership: candidate_id)
  remove: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: remove work experience" });
  },
};
