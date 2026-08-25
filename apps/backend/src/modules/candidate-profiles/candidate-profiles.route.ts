import { Router } from "express";
import {
  createMyEducation,
  createMyWorkExperience,
  deleteMyEducation,
  deleteMyWorkExperience,
  getMyCandidateProfile,
  listMyEducations,
  listMyWorkExperiences,
  updateMyCandidateProfile,
  updateMyEducation,
  updateMyWorkExperience,
} from "./candidate-profiles.controller";

const candidateProfilesRouter = Router();

candidateProfilesRouter.get("/me", getMyCandidateProfile);
candidateProfilesRouter.put("/me", updateMyCandidateProfile);

candidateProfilesRouter.get("/me/educations", listMyEducations);
candidateProfilesRouter.post("/me/educations", createMyEducation);
candidateProfilesRouter.put("/me/educations/:id", updateMyEducation);
candidateProfilesRouter.delete("/me/educations/:id", deleteMyEducation);

candidateProfilesRouter.get("/me/work-experiences", listMyWorkExperiences);
candidateProfilesRouter.post("/me/work-experiences", createMyWorkExperience);
candidateProfilesRouter.put("/me/work-experiences/:id", updateMyWorkExperience);
candidateProfilesRouter.delete("/me/work-experiences/:id", deleteMyWorkExperience);

export default candidateProfilesRouter;
