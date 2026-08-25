import { Router } from "express";
import { usersController } from "./users.controller";

const usersRouter = Router();

usersRouter.get("/", usersController.list);
usersRouter.get("/:id", usersController.detail);
usersRouter.put("/:id/status", usersController.updateStatus);

export default usersRouter;
