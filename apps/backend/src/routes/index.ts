import { Router } from "express";
import adminRouter from "../modules/admin/admin.route";
import applicationsRouter, {
  jobsApplicationsRouter,
  savedJobsRouter,
} from "../modules/applications/applications.route";
import authRouter from "../modules/auth/auth.route";
import candidateProfilesRouter from "../modules/candidate-profiles/candidate-profiles.route";
import companiesRouter from "../modules/companies/companies.route";
import educationsRouter from "../modules/educations/educations.route";
import jobsRouter from "../modules/jobs/jobs.route";
import mediaRouter from "../modules/media/media.route";
import notificationsRouter from "../modules/notifications/notifications.route";
import resumesRouter from "../modules/resumes/resumes.route";
import savedJobsRouter from "../modules/saved-jobs/saved-jobs.route";
import systemLogsRouter from "../modules/system-logs/system-logs.route";
import usersRouter from "../modules/users/users.route";
import workExperiencesRouter from "../modules/work-experiences/work-experiences.route";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/companies", companiesRouter);
apiRouter.use("/jobs", jobsApplicationsRouter);
apiRouter.use("/jobs", jobsRouter);
apiRouter.use("/media", mediaRouter);
apiRouter.use("/candidate-profiles", candidateProfilesRouter);
apiRouter.use("/educations", educationsRouter);
apiRouter.use("/work-experiences", workExperiencesRouter);
apiRouter.use("/resumes", resumesRouter);
apiRouter.use("/saved-jobs", savedJobsRouter);
apiRouter.use("/applications", applicationsRouter);
apiRouter.use("/admin/system-logs", systemLogsRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/notifications", notificationsRouter);

export default apiRouter;
