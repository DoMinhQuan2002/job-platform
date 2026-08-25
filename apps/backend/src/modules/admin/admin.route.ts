import { Router } from "express";
import { authenticate } from "@/common/middlewares/authenticate.middleware";
import { requireAdmin } from "./admin.middleware";
import usersRouter from "./users/users.route";
import companiesRouter from "./companies/companies.route";

const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.use("/users", usersRouter);
adminRouter.use("/companies", companiesRouter);

export default adminRouter;
