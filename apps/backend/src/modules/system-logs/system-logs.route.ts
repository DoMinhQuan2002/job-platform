import { Router } from "express";
import { fakeAuth, requireAdmin } from "./system-logs.middleware";
import { systemLogsController } from "./system-logs.controller";

const systemLogsRouter = Router();

systemLogsRouter.use(fakeAuth, requireAdmin);

systemLogsRouter.get("/", systemLogsController.list);
systemLogsRouter.get("/:id", systemLogsController.detail);

export default systemLogsRouter;
