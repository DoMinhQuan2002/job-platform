import { Router } from "express";
import { authenticate } from "../../common/middlewares/authenticate.middleware";
import { requireRecruiter } from "../../common/middlewares/require-recruiter.middleware";
import { jobsController } from "./jobs.controller";

const recruiterJobsRouter = Router();

recruiterJobsRouter.get("/jobs", authenticate, requireRecruiter, jobsController.getRecruiterJobs);
recruiterJobsRouter.get("/jobs/:id", authenticate, requireRecruiter, jobsController.getRecruiterJobById);

export default recruiterJobsRouter;
