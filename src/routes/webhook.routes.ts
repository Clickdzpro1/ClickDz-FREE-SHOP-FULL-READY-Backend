import { Router } from "express";
import * as ctrl from "../controllers/webhook.controller";
import { authenticate, validate } from "../middleware";
import { createWebhookSchema, updateWebhookSchema } from "../schemas/webhook.schema";

const router = Router();

router.use(authenticate);

router.post("/", validate(createWebhookSchema), ctrl.createWebhook);
router.get("/", ctrl.listWebhooks);
router.put("/:id", validate(updateWebhookSchema), ctrl.updateWebhook);
router.delete("/:id", ctrl.removeWebhook);
router.get("/:id/deliveries", ctrl.getDeliveries);

export default router;
