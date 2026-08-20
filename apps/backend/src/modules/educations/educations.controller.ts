import { Request, Response } from "express";

export const educationsController = {
  // TODO: POST / — Thêm một mục học vấn
  create: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: create education" });
  },

  // TODO: PUT /:id — Sửa học vấn (validate ownership: candidate_id)
  update: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: update education" });
  },

  // TODO: DELETE /:id — Xóa học vấn (validate ownership: candidate_id)
  remove: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: remove education" });
  },
};
