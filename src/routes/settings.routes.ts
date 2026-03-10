import { Router } from "express";
import * as ctrl from "../controllers/settings.controller";
import { authenticate, adminGuard } from "../middleware";

const router = Router();

// Public — read-only store settings
router.get("/", ctrl.getSettings);
router.get("/:key", ctrl.getSetting);

// Admin
router.put("/", authenticate, adminGuard, ctrl.updateSettings);

export default router;
