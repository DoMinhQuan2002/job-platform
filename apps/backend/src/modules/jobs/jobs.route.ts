import { Router } from "express";
import { jobsController } from "./jobs.controller";

const jobsRouter = Router();

/**
 * POST /api/v1/jobs
 *
 * TODO(auth): Controller yêu cầu `req.user = { id, role }`. Khi nhóm Auth hoàn
 * thành middleware, đổi thành:
 * jobsRouter.post("/", authenticate, jobsController.createJob);
 * và import `authenticate` từ middleware dùng chung của module Auth.
 */
jobsRouter.post("/", jobsController.createJob);

/** GET /api/v1/jobs - Danh sách job đã duyệt, còn hạn (public). */
jobsRouter.get("/", jobsController.getJobs);

/** GET /api/v1/jobs/:id - Chi tiết job đã duyệt, còn hạn (public). */
jobsRouter.get("/:id", jobsController.getJobById);

/**
 * PUT /api/v1/jobs/:id
 *
 * TODO(auth): Bảo vệ route bằng cùng middleware với POST ở trên:
 * jobsRouter.put("/:id", authenticate, jobsController.updateJob);
 * Service vẫn chịu trách nhiệm kiểm tra role và quyền sở hữu company.
 */
jobsRouter.put("/:id", jobsController.updateJob);

export default jobsRouter;
