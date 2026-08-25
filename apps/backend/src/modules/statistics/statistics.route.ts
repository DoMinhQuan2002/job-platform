// Route thống kê, mount tại /admin/statistics.
import { Router } from "express";
import { authenticate } from "@/common/middlewares/authenticate.middleware";
import { requireAdmin } from "./statistics.middleware";
import { statisticsController } from "./statistics.controller";

const statisticsRouter = Router();

statisticsRouter.use(authenticate, requireAdmin);

statisticsRouter.get("/", statisticsController.overview);

export default statisticsRouter;
