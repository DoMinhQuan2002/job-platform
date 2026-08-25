import { Router } from "express";
import { workExperiencesController } from "./work-experiences.controller";

const workExperiencesRouter = Router();

// POST   /api/work-experiences        — Thêm kinh nghiệm
workExperiencesRouter.post("/", workExperiencesController.create);

// PUT    /api/work-experiences/:id    — Sửa kinh nghiệm
workExperiencesRouter.put("/:id", workExperiencesController.update);

// DELETE /api/work-experiences/:id    — Xóa kinh nghiệm
workExperiencesRouter.delete("/:id", workExperiencesController.remove);

export default workExperiencesRouter;
