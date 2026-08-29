import { Router } from "express";
import { authenticate } from "../../common/middlewares/authenticate.middleware";
import { requireRecruiter } from "../../common/middlewares/require-recruiter.middleware";
import { recruiterStatisticsController } from "./recruiter-statistics.controller";

const recruiterStatisticsRouter = Router();

recruiterStatisticsRouter.use(authenticate, requireRecruiter);

recruiterStatisticsRouter.get(
  "/overview",
  recruiterStatisticsController.getOverview,
);
recruiterStatisticsRouter.get(
  "/applications-by-status",
  recruiterStatisticsController.getApplicationsByStatus,
);
recruiterStatisticsRouter.get(
  "/recent-jobs",
  recruiterStatisticsController.getRecentJobs,
);
recruiterStatisticsRouter.get(
  "/candidate-trend",
  recruiterStatisticsController.getCandidateTrend,
);

export default recruiterStatisticsRouter;
