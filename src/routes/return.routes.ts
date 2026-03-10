import { Router } from "express";
import * as ctrl from "../controllers/return.controller";
import { authenticate, adminGuard, validate } from "../middleware";
import { createReturnSchema, updateReturnStatusSchema } from "../schemas/return.schema";

const router = Router();

// Customer routes
router.post("/", authenticate, validate(createReturnSchema), ctrl.createReturn);
router.get("/", authenticate, ctrl.getMyReturns);
router.get("/:id", authenticate, ctrl.getReturnById);

// Admin routes
router.get("/admin/all", authenticate, adminGuard, ctrl.listAllReturns);
router.patch("/admin/:id/status", authenticate, adminGuard, validate(updateReturnStatusSchema), ctrl.updateReturnStatus);

export default router;
