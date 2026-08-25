import { Router } from "express";
import { jobsController } from "./jobs.controller";

const jobCategoriesRouter = Router();

jobCategoriesRouter.get("/", jobsController.getJobCategories);

export default jobCategoriesRouter;
