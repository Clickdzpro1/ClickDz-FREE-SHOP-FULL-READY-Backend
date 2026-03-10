import { Router } from "express";
import * as ctrl from "../controllers/newsletter.controller";
import { authenticate, adminGuard, validate } from "../middleware";
import { subscribeNewsletterSchema, unsubscribeNewsletterSchema } from "../schemas/newsletter.schema";

const router = Router();

// Public
router.post("/subscribe", validate(subscribeNewsletterSchema), ctrl.subscribe);
router.post("/unsubscribe", validate(unsubscribeNewsletterSchema), ctrl.unsubscribe);

// Admin
router.get("/", authenticate, adminGuard, ctrl.listSubscribers);
router.get("/stats", authenticate, adminGuard, ctrl.getStats);
router.get("/export", authenticate, adminGuard, ctrl.exportEmails);

export default router;
