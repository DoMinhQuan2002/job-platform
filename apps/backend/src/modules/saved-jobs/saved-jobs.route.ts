import { Router } from "express";
import { savedJobsController } from "./saved-jobs.controller";

const savedJobsRouter = Router();

// POST   /api/saved-jobs          — Lưu Job vào danh sách yêu thích
savedJobsRouter.post("/", savedJobsController.save);

// GET    /api/saved-jobs/me       — Danh sách Job đã lưu (JOIN jobs + companies)
savedJobsRouter.get("/me", savedJobsController.getMySavedJobs);

// DELETE /api/saved-jobs/:jobId   — Bỏ lưu Job
savedJobsRouter.delete("/:jobId", savedJobsController.unsave);

export default savedJobsRouter;
