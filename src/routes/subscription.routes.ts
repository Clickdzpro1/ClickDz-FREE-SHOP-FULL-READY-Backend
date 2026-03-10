import { Router } from "express";
import * as ctrl from "../controllers/subscription.controller";
import { authenticate, adminGuard, validate } from "../middleware";
import { createSubscriptionSchema, updateIntervalSchema } from "../schemas/subscription.schema";

const router = Router();

router.use(authenticate);

router.post("/", validate(createSubscriptionSchema), ctrl.createSubscription);
router.get("/", ctrl.getMySubscriptions);
router.patch("/:id/pause", ctrl.pauseSubscription);
router.patch("/:id/resume", ctrl.resumeSubscription);
router.patch("/:id/cancel", ctrl.cancelSubscription);
router.patch("/:id/interval", validate(updateIntervalSchema), ctrl.updateInterval);

// Admin
router.post("/process-due", adminGuard, ctrl.processDue);

export default router;
