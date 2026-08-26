import { Router } from "express";
import { authenticate } from "../../common/middlewares/authenticate.middleware";
import { applicationsController } from "./applications.controller";

/**
 * Applications Router: Mounted at /api/v1/applications
 */
const applicationsRouter = Router();

applicationsRouter.use(authenticate);

applicationsRouter.get("/", applicationsController.listApplications);
applicationsRouter.get("/:id", applicationsController.getApplicationById);
applicationsRouter.put("/:id/status", applicationsController.updateStatus);
applicationsRouter.post("/:id/withdraw", applicationsController.withdraw);

/**
 * Saved Jobs Router: Mounted at /api/v1/saved-jobs
 */
export const savedJobsRouter = Router();

savedJobsRouter.use(authenticate);
savedJobsRouter.get("/", applicationsController.listSavedJobs);

/**
 * Jobs Applications & Saved Jobs Router: Mounted at /api/v1/jobs
 */
export const jobsApplicationsRouter = Router();

jobsApplicationsRouter.post("/:jobId/apply", authenticate, applicationsController.apply);
jobsApplicationsRouter.post("/:jobId/save", authenticate, applicationsController.saveJob);
jobsApplicationsRouter.delete("/:jobId/save", authenticate, applicationsController.unsaveJob);

export default applicationsRouter;
