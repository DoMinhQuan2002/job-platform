import { Router } from "express";
import adminRouter from "../modules/admin/admin.route";
import applicationsRouter, {
  jobsApplicationsRouter,
  savedJobsRouter,
} from "../modules/applications/applications.route";
import authRouter from "../modules/auth/auth.route";
import candidateProfilesRouter from "../modules/candidate-profiles/candidate-profiles.route";
import skillsRouter from "../modules/candidate-profiles/skills.route";
import companiesRouter from "../modules/companies/companies.route";
import jobsRouter from "../modules/jobs/jobs.route";
import jobCategoriesRouter from "../modules/jobs/job-categories.route";
import recruiterJobsRouter from "../modules/jobs/recruiter-jobs.route";
import mediaRouter from "../modules/media/media.route";
import notificationsRouter from "../modules/notifications/notifications.route";
import resumesRouter from "../modules/resumes/resumes.route";
import statisticsRouter from "../modules/statistics/statistics.route";
import recruiterStatisticsRouter from "../modules/recruiter-statistics/recruiter-statistics.route";
import systemLogsRouter from "../modules/system-logs/system-logs.route";
import usersRouter from "../modules/users/users.route";
import workExperiencesRouter from "../modules/work-experiences/work-experiences.route";

const apiRouter = Router();

// Contract nhom 1 dat auth ngay duoi /api/v1 (/register, /login, /forgot-password, /oauth/google)
// nen authRouter duoc mount o goc thay vi duoi prefix /auth.
apiRouter.use("/", authRouter);

apiRouter.use("/users", usersRouter);
apiRouter.use("/companies", companiesRouter);
apiRouter.use("/jobs", jobsApplicationsRouter);
apiRouter.use("/jobs", jobsRouter);
apiRouter.use("/job-categories", jobCategoriesRouter);
apiRouter.use("/recruiter/statistics", recruiterStatisticsRouter);
apiRouter.use("/recruiter", recruiterJobsRouter);
apiRouter.use("/media", mediaRouter);
apiRouter.use("/candidate-profiles", candidateProfilesRouter);
apiRouter.use("/candidates", candidateProfilesRouter);
apiRouter.use("/skills", skillsRouter);
apiRouter.use("/work-experiences", workExperiencesRouter);
apiRouter.use("/resumes", resumesRouter);
apiRouter.use("/saved-jobs", savedJobsRouter);
apiRouter.use("/applications", applicationsRouter);
apiRouter.use("/admin/system-logs", systemLogsRouter);
apiRouter.use("/admin/statistics", statisticsRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/notifications", notificationsRouter);

export default apiRouter;
