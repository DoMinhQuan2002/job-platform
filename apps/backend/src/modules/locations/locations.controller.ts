import type { Request, Response } from "express";
import { AppError } from "@/common/errors/app-error";
import { locationsService } from "./locations.service";

const parseCode = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 20) {
    throw new AppError(400, "INVALID_LOCATION_CODE", `${field} không hợp lệ`);
  }
  return value.trim();
};

const cacheReferenceData = (res: Response) => {
  res.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
};

export const locationsController = {
  listProvinces: async (_req: Request, res: Response) => {
    const data = await locationsService.listProvinces();
    cacheReferenceData(res);
    res.status(200).json({ success: true, data });
  },

  listWards: async (req: Request, res: Response) => {
    const provinceCode = parseCode(req.params.provinceCode, "provinceCode");
    const data = await locationsService.listWards(provinceCode);
    cacheReferenceData(res);
    res.status(200).json({ success: true, data });
  },

  getWard: async (req: Request, res: Response) => {
    const code = parseCode(req.params.code, "code");
    const data = await locationsService.getWard(code);
    cacheReferenceData(res);
    res.status(200).json({ success: true, data });
  },
};
