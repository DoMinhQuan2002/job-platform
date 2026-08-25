import { Router } from "express";
import adminRouter from "../modules/admin/admin.route";
import applicationsRouter from "../modules/applications/applications.route";
import authRouter from "../modules/auth/auth.route";
import candidateProfilesRouter from "../modules/candidate-profiles/candidate-profiles.route";
import skillsRouter from "../modules/candidate-profiles/skills.route";
import companiesRouter from "../modules/companies/companies.route";
import jobsRouter from "../modules/jobs/jobs.route";
import mediaRouter from "../modules/media/media.route";
import notificationsRouter from "../modules/notifications/notifications.route";
import resumesRouter from "../modules/resumes/resumes.route";
import systemLogsRouter from "../modules/system-logs/system-logs.route";
import usersRouter from "../modules/users/users.route";
import workExperiencesRouter from "../modules/work-experiences/work-experiences.route";

const apiRouter = Router();

// Contract nhom 1 dat auth ngay duoi /api/v1 (/register, /login, /forgot-password, /oauth/google)
// nen authRouter duoc mount o goc thay vi duoi prefix /auth.
apiRouter.use("/", authRouter);

apiRouter.use("/users", usersRouter);
apiRouter.use("/companies", companiesRouter);
apiRouter.use("/jobs", jobsRouter);
apiRouter.use("/media", mediaRouter);
apiRouter.use("/candidate-profiles", candidateProfilesRouter);
apiRouter.use("/candidates", candidateProfilesRouter);
apiRouter.use("/skills", skillsRouter);
apiRouter.use("/work-experiences", workExperiencesRouter);
apiRouter.use("/resumes", resumesRouter);
apiRouter.use("/applications", applicationsRouter);
apiRouter.use("/admin/system-logs", systemLogsRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/notifications", notificationsRouter);

export default apiRouter;
