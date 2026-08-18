import { Router } from "express";
import { mediaController } from "./media.controller";

const mediaRouter = Router();

mediaRouter.post("/icons", mediaController.saveIcon);

export default mediaRouter;
