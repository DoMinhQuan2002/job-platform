import { Router } from "express";

const candidateProfilesRouter = Router();

candidateProfilesRouter.get("/me", (_req, res) => {
  res.status(200).json({ module: "candidate-profiles", message: "TODO: candidate profile" });
});

export default candidateProfilesRouter;
