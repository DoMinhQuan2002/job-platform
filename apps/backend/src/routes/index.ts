import { Router } from "express";
import adminRouter from "../modules/admin/admin.route";
import applicationsRouter from "../modules/applications/applications.route";
import authRouter from "../modules/auth/auth.route";
import candidateProfilesRouter from "../modules/candidate-profiles/candidate-profiles.route";
import companiesRouter from "../modules/companies/companies.route";
import jobsRouter from "../modules/jobs/jobs.route";
import mediaRouter from "../modules/media/media.route";
import usersRouter from "../modules/users/users.route";

const apiRouter = Router();

// Contract nhom 1 dat auth ngay duoi /api/v1 (/register, /login, /forgot-password, /oauth/google)
// nen authRouter duoc mount o goc thay vi duoi prefix /auth.
apiRouter.use("/", authRouter);

apiRouter.use("/users", usersRouter);
apiRouter.use("/companies", companiesRouter);
apiRouter.use("/jobs", jobsRouter);
apiRouter.use("/media", mediaRouter);
apiRouter.use("/candidate-profiles", candidateProfilesRouter);
apiRouter.use("/applications", applicationsRouter);
apiRouter.use("/admin", adminRouter);

export default apiRouter;
