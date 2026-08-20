import { Request, Response } from "express";

export const savedJobsController = {
  // TODO: POST / — Lưu Job (body: { jobId })
  save: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: save job" });
  },

  // TODO: GET /me — Danh sách Job đã lưu (JOIN jobs, companies từ Nhóm 2)
  // Nếu job đã hết hạn/đóng → đánh dấu isExpired: true
  getMySavedJobs: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: getMySavedJobs" });
  },

  // TODO: DELETE /:jobId — Bỏ lưu Job
  unsave: (_req: Request, res: Response) => {
    res.status(501).json({ message: "TODO: unsave job" });
  },
};
