import { Router } from "express";

const companiesRouter = Router();

companiesRouter.get("/", (_req, res) => {
  res.status(200).json({ module: "companies", message: "TODO: companies list" });
});

export default companiesRouter;
