import { Router } from "express";
import * as ctrl from "../controllers/twoFactor.controller";
import { authenticate, validate } from "../middleware";
import { twoFactorSetupSchema, twoFactorVerifySchema } from "../schemas/bulk.schema";

const router = Router();

// Authenticated routes (manage 2FA)
router.post("/setup", authenticate, ctrl.setup);
router.post("/verify", authenticate, validate(twoFactorSetupSchema), ctrl.verify);
router.post("/disable", authenticate, validate(twoFactorSetupSchema), ctrl.disable);

// Login validation (not authenticated — used during login flow)
router.post("/validate", validate(twoFactorVerifySchema), ctrl.validateLogin);

export default router;
