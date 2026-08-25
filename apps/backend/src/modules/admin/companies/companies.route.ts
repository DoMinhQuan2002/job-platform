// Route quản lý công ty, mount tại /admin/companies (auth+quyền admin gắn sẵn ở admin.route.ts).
import { Router } from "express";
import { companiesController } from "./companies.controller";

const companiesRouter = Router();

companiesRouter.get("/", companiesController.list);
companiesRouter.get("/:id", companiesController.detail);
companiesRouter.put("/:id/status", companiesController.updateStatus);

export default companiesRouter;
