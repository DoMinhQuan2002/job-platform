import { Router } from "express";
import {
  authenticate,
  optionalAuthenticate,
} from "../../common/middlewares/authenticate.middleware";
import { requireRecruiter } from "../../common/middlewares/require-recruiter.middleware";
import { jobsController } from "./jobs.controller";

const jobsRouter = Router();

/** POST /api/v1/jobs - Recruiter tạo tin; service kiểm tra quyền sở hữu company. */
jobsRouter.post("/", authenticate, requireRecruiter, jobsController.createJob);

/** GET /api/v1/jobs - Danh sách job đã duyệt, còn hạn (public). */
jobsRouter.get("/", optionalAuthenticate, jobsController.getJobs);

/** GET /api/v1/jobs/:id - Chi tiết job đã duyệt, còn hạn (public). */
jobsRouter.get("/:id", optionalAuthenticate, jobsController.getJobById);

/** PUT /api/v1/jobs/:id - Chỉ chủ company hoặc admin được cập nhật. */
jobsRouter.put("/:id", authenticate, requireRecruiter, jobsController.updateJob);

jobsRouter.patch("/:id", authenticate, requireRecruiter, jobsController.updateJobStatus);

export default jobsRouter;
