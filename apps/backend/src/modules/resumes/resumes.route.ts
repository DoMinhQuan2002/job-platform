import { Router } from "express";
import { resumesController } from "./resumes.controller";
import { acceptOptionalUpload } from "../../common/middlewares/upload.middleware";

/** Owner: Nguyễn Văn Lợi — Base: /api/v1/resumes */
const resumesRouter = Router();

resumesRouter.get("/", resumesController.getMyResumes);
resumesRouter.post("/", acceptOptionalUpload, resumesController.createOwnerResume); //sử dụng 'Media' để upload cv vào supabase
resumesRouter.get("/:id", resumesController.getById);
resumesRouter.put("/:id/default", resumesController.setDefault);
resumesRouter.delete("/:id", resumesController.deleteMine);

// Tuỳ chọn để Stream/Lấy Signed URL cho CV
resumesRouter.get("/:id/access", resumesController.getAccessUrl);

export default resumesRouter;
