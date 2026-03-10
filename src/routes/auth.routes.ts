import { Router } from "express";
import * as ctrl from "../controllers/auth.controller";
import { authenticate, validate, authRateLimit } from "../middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema";

const router = Router();

router.post("/register", authRateLimit, validate(registerSchema), ctrl.register);
router.post("/login", authRateLimit, validate(loginSchema), ctrl.login);
router.post("/refresh", validate(refreshTokenSchema), ctrl.refreshToken);
router.post("/logout", validate(refreshTokenSchema), ctrl.logout);
router.post("/logout-all", authenticate, ctrl.logoutAll);
router.get("/profile", authenticate, ctrl.getProfile);
router.patch("/profile", authenticate, validate(updateProfileSchema), ctrl.updateProfile);
router.post("/change-password", authenticate, validate(changePasswordSchema), ctrl.changePassword);
router.post("/forgot-password", authRateLimit, validate(forgotPasswordSchema), ctrl.forgotPassword);
router.post("/reset-password", authRateLimit, validate(resetPasswordSchema), ctrl.resetPassword);

export default router;
