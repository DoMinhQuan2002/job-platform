import { Router } from "express";
import { acceptOptionalUpload } from "../../common/middlewares/upload.middleware";
import { mediaController } from "./media.controller";

const mediaRouter = Router();

mediaRouter.post("/uploads", acceptOptionalUpload, mediaController.upload);
mediaRouter.post("/icons", mediaController.saveIcon);
mediaRouter.get("/access", mediaController.getAccessUrl);
mediaRouter.delete("/", mediaController.remove);

export default mediaRouter;
