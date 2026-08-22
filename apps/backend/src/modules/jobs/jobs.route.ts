import { Router } from "express";

const jobsRouter = Router();

jobsRouter.get("/", (_req, res) => {
  res.status(200).json({ module: "jobs", message: "TODO: jobs list" });
});

export default jobsRouter;
