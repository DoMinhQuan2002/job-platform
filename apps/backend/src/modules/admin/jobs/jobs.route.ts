import { Router } from "express";
import { jobsController } from "./jobs.controller";

const jobsRouter = Router();

jobsRouter.get("/", jobsController.list);
jobsRouter.get("/:id", jobsController.detail);
jobsRouter.put("/:id/approve", jobsController.approve);
jobsRouter.put("/:id/reject", jobsController.reject);
jobsRouter.delete("/:id", jobsController.remove);

export default jobsRouter;
