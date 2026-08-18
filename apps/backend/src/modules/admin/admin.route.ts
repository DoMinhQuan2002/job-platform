import { Router } from "express";

const adminRouter = Router();

adminRouter.get("/overview", (_req, res) => {
  res.status(200).json({ module: "admin", message: "TODO: admin overview" });
});

export default adminRouter;
