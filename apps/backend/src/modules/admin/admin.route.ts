// Gộp router con của các tài nguyên admin quản lý (users/companies/jobs/...),
// gắn sẵn authenticate + requireAdmin cho toàn bộ /admin/*.
import { Router } from "express";
import { authenticate } from "@/common/middlewares/authenticate.middleware";
import { requireAdmin } from "./admin.middleware";
import usersRouter from "./users/users.route";
import companiesRouter from "./companies/companies.route";
import jobsRouter from "./jobs/jobs.route";
import jobCategoriesRouter from "./job-categories/job-categories.route";

const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.use("/users", usersRouter);
adminRouter.use("/companies", companiesRouter);
adminRouter.use("/jobs", jobsRouter);
adminRouter.use("/job-categories", jobCategoriesRouter);

export default adminRouter;
