// Route quản lý tài khoản, mount tại /admin/users (auth+quyền admin gắn sẵn ở admin.route.ts).
import { Router } from "express";
import { usersController } from "./users.controller";

const usersRouter = Router();

usersRouter.get("/", usersController.list);
usersRouter.get("/:id", usersController.detail);
usersRouter.put("/:id/status", usersController.updateStatus);

export default usersRouter;
