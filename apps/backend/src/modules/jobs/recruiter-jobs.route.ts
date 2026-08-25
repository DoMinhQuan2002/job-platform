import { Router } from "express";
import { authenticate } from "../../common/middlewares/authenticate.middleware";
import { requireRecruiter } from "../../common/middlewares/require-recruiter.middleware";
import { jobsController } from "./jobs.controller";

const recruiterJobsRouter = Router();

recruiterJobsRouter.get("/jobs", authenticate, requireRecruiter, jobsController.getRecruiterJobs);

export default recruiterJobsRouter;
