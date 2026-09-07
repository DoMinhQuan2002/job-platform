// Handler HTTP cho GET /admin/statistics và GET /admin/statistics/trends
import { Request, Response } from "express";
import { statisticsService } from "./statistics.service";

export const statisticsController = {
  overview: async (_req: Request, res: Response) => {
    const data = await statisticsService.overview();

    res.status(200).json({ success: true, message: "Thành công", data });
  },

  trends: async (req: Request, res: Response) => {
    const range = req.query.range as string | undefined;
    const fromDate = req.query.fromDate as string | undefined;
    const toDate = req.query.toDate as string | undefined;

    const data = await statisticsService.trends({ range, fromDate, toDate });

    res.status(200).json({ success: true, message: "Thành công", data });
  },
};


