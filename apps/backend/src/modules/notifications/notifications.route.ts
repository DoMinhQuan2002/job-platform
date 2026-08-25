import { Router } from "express";
import { authenticate } from "@/common/middlewares/authenticate.middleware";
import { requireAuth } from "./notifications.middleware";
import { notificationsController } from "./notifications.controller";

const notificationsRouter = Router();

notificationsRouter.use(authenticate, requireAuth);

notificationsRouter.get("/", notificationsController.list);
notificationsRouter.get("/unread-count", notificationsController.unreadCount);
// "read-all" phải khai trước "/:id/read" — không thì Express khớp "read-all" thành :id
notificationsRouter.patch("/read-all", notificationsController.markAllRead);
notificationsRouter.patch("/:id/read", notificationsController.markRead);
notificationsRouter.delete("/:id", notificationsController.remove);

export default notificationsRouter;
