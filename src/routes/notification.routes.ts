import { Router } from "express";
import * as ctrl from "../controllers/notification.controller";
import { authenticate } from "../middleware";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.getNotifications);
router.patch("/:id/read", ctrl.markAsRead);
router.patch("/read-all", ctrl.markAllAsRead);

export default router;
