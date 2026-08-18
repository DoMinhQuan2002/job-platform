import { Router } from "express";

const applicationsRouter = Router();

applicationsRouter.get("/", (_req, res) => {
  res.status(200).json({ module: "applications", message: "TODO: applications list" });
});

export default applicationsRouter;
