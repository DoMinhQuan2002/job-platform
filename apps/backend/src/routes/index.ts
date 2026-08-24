import { Router } from "express";
import adminRouter from "../modules/admin/admin.route";
import applicationsRouter from "../modules/applications/applications.route";
import authRouter from "../modules/auth/auth.route";
import candidateProfilesRouter from "../modules/candidate-profiles/candidate-profiles.route";
import skillsRouter from "../modules/candidate-profiles/skills.route";
import companiesRouter from "../modules/companies/companies.route";
import jobsRouter from "../modules/jobs/jobs.route";
import mediaRouter from "../modules/media/media.route";
import usersRouter from "../modules/users/users.route";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/companies", companiesRouter);
apiRouter.use("/jobs", jobsRouter);
apiRouter.use("/media", mediaRouter);
apiRouter.use("/candidate-profiles", candidateProfilesRouter);
apiRouter.use("/candidates", candidateProfilesRouter);
apiRouter.use("/skills", skillsRouter);
apiRouter.use("/applications", applicationsRouter);
apiRouter.use("/admin", adminRouter);

export default apiRouter;
