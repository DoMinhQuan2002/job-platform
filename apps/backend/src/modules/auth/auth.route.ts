import { Router } from "express";
import { authController } from "./auth.controller";

const authRouter = Router();

authRouter.get("/health", authController.health);

export default authRouter;
