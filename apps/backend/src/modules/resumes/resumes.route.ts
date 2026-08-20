import { Router } from "express";
import { resumesController } from "./resumes.controller";

const resumesRouter = Router();

// GET    /api/resumes/me              — Lấy danh sách CV
resumesRouter.get("/me", resumesController.getMyResumes);

// POST   /api/resumes/me/upload       — Upload file CV (multipart/form-data)
resumesRouter.post("/me/upload", resumesController.upload);

// PATCH  /api/resumes/me/:id/set-default — Đặt CV làm mặc định
resumesRouter.patch("/me/:id/set-default", resumesController.setDefault);

// DELETE /api/resumes/me/:id          — Soft-delete CV
resumesRouter.delete("/me/:id", resumesController.remove);

export default resumesRouter;
