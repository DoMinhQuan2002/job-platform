import { Router } from "express";
import { authenticate } from "@/common/middlewares/authenticate.middleware";
import { usersController } from "./users.controller";
import { avatarUpload } from "@/common/middlewares/upload.middleware";

const usersRouter = Router();


usersRouter.get("/me", authenticate, usersController.getMe);
usersRouter.patch("/me", authenticate, usersController.updateMe);
usersRouter.post("/me/avatar", authenticate, avatarUpload.single("avatar"), usersController.uploadAvatar);
usersRouter.delete("/me/avatar", authenticate, usersController.deleteAvatar);
usersRouter.patch("/me/password", authenticate, usersController.changePassword);

export default usersRouter;
