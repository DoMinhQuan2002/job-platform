import { Router } from "express";
import { applicationsController } from "./applications.controller";

/**
 * Applications Router: Mounted at /api/v1/applications
 */
const applicationsRouter = Router();

applicationsRouter.get("/", applicationsController.listApplications);
applicationsRouter.get("/:id", applicationsController.getApplicationById);
applicationsRouter.put("/:id/status", applicationsController.updateStatus);
applicationsRouter.post("/:id/withdraw", applicationsController.withdraw);

/**
 * Saved Jobs Router: Mounted at /api/v1/saved-jobs
 */
export const savedJobsRouter = Router();

savedJobsRouter.get("/", applicationsController.listSavedJobs);

/**
 * Jobs Applications & Saved Jobs Router: Mounted at /api/v1/jobs
 */
export const jobsApplicationsRouter = Router();

jobsApplicationsRouter.post("/:jobId/apply", applicationsController.apply);
jobsApplicationsRouter.post("/:jobId/save", applicationsController.saveJob);
jobsApplicationsRouter.delete("/:jobId/save", applicationsController.unsaveJob);

export default applicationsRouter;
