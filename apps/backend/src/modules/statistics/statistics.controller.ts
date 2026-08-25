// Handler HTTP cho GET /admin/statistics.
import { Request, Response } from "express";
import { statisticsService } from "./statistics.service";

export const statisticsController = {
  overview: async (_req: Request, res: Response) => {
    const data = await statisticsService.overview();

    res.status(200).json({ success: true, message: "Thành công", data });
  },
};
