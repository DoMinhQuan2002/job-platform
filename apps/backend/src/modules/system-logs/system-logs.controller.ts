import { Request, Response } from "express";
import { validateIdParam, validateListQuery } from "./system-logs.validation";
import { systemLogsService } from "./system-logs.service";

export const systemLogsController = {
  list: async (req: Request, res: Response) => {
    const query = validateListQuery(req.query as Record<string, unknown>);
    const result = await systemLogsService.list(query);

    res.status(200).json({ success: true, message: "Thành công", data: result });
  },

  detail: async (req: Request, res: Response) => {
    const id = validateIdParam(req.params);
    const log = await systemLogsService.detail(id);

    res.status(200).json({ success: true, message: "Thành công", data: log });
  },
};
