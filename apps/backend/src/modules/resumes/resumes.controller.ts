import type { NextFunction, Request, Response } from "express";
import { requireCandidate } from "../../common/utils/auth-user";
import { resumesService } from "./resumes.service";

const readId = (req: Request) => {
  const value = req.params.id;
  return Array.isArray(value) ? value[0] : value;
};

/** Owner: Nguyễn Văn Lợi */
export const resumesController = {
  getMyResumes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCandidate(req);
      const data = await resumesService.getMyResumes(user.id);
      res.json({ success: true, message: "Thành công", data });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCandidate(req);
      const data = await resumesService.getById(user.id, readId(req));
      res.json({ success: true, message: "Thành công", data });
    } catch (error) {
      next(error);
    }
  },

  createOwnerResume: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCandidate(req);
      // Data lúc này nhận TRỰC TIẾP req.file qua middleware multer
      const data = await resumesService.createOwnerResume(user.id, req.file);
      res.json({ success: true, message: "Tạo CV thành công", data });
    } catch (error) {
      next(error);
    }
  },

  setDefault: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCandidate(req);
      const data = await resumesService.setDefault(user.id, readId(req));
      res.json({ success: true, message: "Đặt mặc định thành công", data });
    } catch (error) {
      next(error);
    }
  },

  deleteMine: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCandidate(req);
      await resumesService.deleteMine(user.id, readId(req));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  
  getAccessUrl: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = requireCandidate(req);
      const data = await resumesService.getAccessUrl(user.id, readId(req));
      res.json({ success: true, message: "Lấy Link thành công", data });
    } catch (error) {
      next(error);
    }
  }
};
