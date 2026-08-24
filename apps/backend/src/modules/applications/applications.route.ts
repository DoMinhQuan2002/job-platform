import { Router } from "express";
import { applicationsController } from "./applications.controller";

/**
 * Applications Router: Mounted at /api/v1/applications
 */
const applicationsRouter = Router();

// POST   /api/applications         — Ứng viên nộp đơn
applicationsRouter.post("/", applicationsController.apply);

// GET    /api/applications/me      — Lịch sử ứng tuyển của ứng viên
applicationsRouter.get("/me", applicationsController.getMyApplications);

// GET    /api/applications/me/:id  — Chi tiết một đơn ứng tuyển
applicationsRouter.get("/me/:id", applicationsController.getMyApplicationById);

// DELETE /api/applications/me/:id  — Rút đơn (chỉ khi status = APPLIED)
applicationsRouter.delete("/me/:id", applicationsController.withdraw);


// RECRUITER - Nhà tuyển dụng
// GET    /api/applications/:jobId — Recruiter lấy danh sách đơn ứng tuyển của một Job
applicationsRouter.get("/job/:id", applicationsController.getApplicationsByJobId);

// PATCH  /api/applications/:id/status — Nhà tuyển dụng cập nhật trạng thái (RECRUITER only)
applicationsRouter.patch("/:id/status", applicationsController.updateStatus);

export default applicationsRouter;
