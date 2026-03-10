import { Router } from "express";
import * as ctrl from "../controllers/coupon.controller";
import { authenticate, adminGuard, validate } from "../middleware";
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from "../schemas/coupon.schema";

const router = Router();

// Customer
router.post("/validate", authenticate, validate(validateCouponSchema), ctrl.validateCoupon);

// Admin
router.get("/", authenticate, adminGuard, ctrl.listCoupons);
router.get("/:id", authenticate, adminGuard, ctrl.getCoupon);
router.post("/", authenticate, adminGuard, validate(createCouponSchema), ctrl.createCoupon);
router.put("/:id", authenticate, adminGuard, validate(updateCouponSchema), ctrl.updateCoupon);
router.delete("/:id", authenticate, adminGuard, ctrl.deleteCoupon);

export default router;
