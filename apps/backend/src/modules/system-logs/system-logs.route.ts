import { Router } from "express";
import { authenticate } from "@/common/middlewares/authenticate.middleware";
import { requireAdmin } from "./system-logs.middleware";
import { systemLogsController } from "./system-logs.controller";

const systemLogsRouter = Router();

systemLogsRouter.use(authenticate, requireAdmin);

systemLogsRouter.get("/", systemLogsController.list);
systemLogsRouter.get("/:id", systemLogsController.detail);

export default systemLogsRouter;
