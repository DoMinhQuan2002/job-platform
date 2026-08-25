import type { NextFunction, Request, Response } from "express";
import { requireCandidate } from "../../common/utils/auth-user";
import { candidateProfilesService } from "../candidate-profiles/candidate-profiles.service";
import { resumesService } from "./resumes.service";

const profileIdOf = async (req: Request) => {
  const user = requireCandidate(req);
  const profile = await candidateProfilesService.getOrCreateByUserId(user.id);
  return profile.id;
};

/** Owner: Nguyễn Văn Lợi */
export const resumesController = {
  getMyResumes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await profileIdOf(req);
      const data = await resumesService.getMyResumes(candidateId);
      res.status(200).json({ success: true, message: "Thành công", data });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await profileIdOf(req);
      const data = await resumesService.getById(candidateId, req.params.id as string);
      res.status(200).json({ success: true, message: "Thành công", data });
    } catch (error) {
      next(error);
    }
  },

  createOwnerResume: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await profileIdOf(req);
      const data = await resumesService.createOwnerResume(candidateId, req.file);
      res.status(201).json({ success: true, message: "Thành công", data });
    } catch (error) {
      next(error);
    }
  },

  setDefault: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await profileIdOf(req);
      const data = await resumesService.setDefault(candidateId, req.params.id as string);
      res.status(200).json({ success: true, message: "Thành công", data });
    } catch (error) {
      next(error);
    }
  },

  deleteMine: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await profileIdOf(req);
      await resumesService.deleteMine(candidateId, req.params.id as string);
      res.status(200).json({ success: true, message: "Thành công", data: null });
    } catch (error) {
      next(error);
    }
  },

  getAccessUrl: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await profileIdOf(req);
      const data = await resumesService.getAccessUrl(candidateId, req.params.id as string);
      res.status(200).json({ success: true, message: "Thành công", data });
    } catch (error) {
      next(error);
    }
  },
};
