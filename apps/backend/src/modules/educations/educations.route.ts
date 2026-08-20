import { Router } from "express";
import { educationsController } from "./educations.controller";

const educationsRouter = Router();

// POST   /api/educations        — Thêm học vấn
educationsRouter.post("/", educationsController.create);

// PUT    /api/educations/:id    — Sửa học vấn
educationsRouter.put("/:id", educationsController.update);

// DELETE /api/educations/:id    — Xóa học vấn
educationsRouter.delete("/:id", educationsController.remove);

export default educationsRouter;
