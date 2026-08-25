// Route quản lý ngành nghề, mount tại /admin/job-categories (auth+quyền admin gắn sẵn ở admin.route.ts).
import { Router } from "express";
import { jobCategoriesController } from "./job-categories.controller";

const jobCategoriesRouter = Router();

jobCategoriesRouter.get("/", jobCategoriesController.list);
jobCategoriesRouter.get("/:id", jobCategoriesController.detail);
jobCategoriesRouter.post("/", jobCategoriesController.create);
jobCategoriesRouter.put("/:id", jobCategoriesController.update);
jobCategoriesRouter.delete("/:id", jobCategoriesController.remove);

export default jobCategoriesRouter;
