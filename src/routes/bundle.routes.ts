import { Router } from "express";
import * as ctrl from "../controllers/bundle.controller";
import { authenticate, adminGuard, validate } from "../middleware";
import { createBundleSchema, updateBundleSchema } from "../schemas/bundle.schema";

const router = Router();

// Public
router.get("/", ctrl.listBundles);
router.get("/:slug", ctrl.getBundleBySlug);

// Admin
router.post("/", authenticate, adminGuard, validate(createBundleSchema), ctrl.createBundle);
router.put("/:id", authenticate, adminGuard, validate(updateBundleSchema), ctrl.updateBundle);
router.delete("/:id", authenticate, adminGuard, ctrl.removeBundle);

export default router;
