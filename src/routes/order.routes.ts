import { Router } from "express";
import * as ctrl from "../controllers/order.controller";
import { authenticate, adminGuard, validate } from "../middleware";
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from "../schemas/order.schema";

const router = Router();

// Customer
router.post("/", authenticate, validate(createOrderSchema), ctrl.createOrder);
router.get("/my", authenticate, ctrl.listMyOrders);
router.get("/my/:id", authenticate, ctrl.getMyOrder);
router.post("/my/:id/cancel", authenticate, ctrl.cancelOrder);

// Admin
router.get("/", authenticate, adminGuard, validate(orderQuerySchema, "query"), ctrl.listAllOrders);
router.get("/:id", authenticate, adminGuard, ctrl.getOrderAdmin);
router.patch("/:id/status", authenticate, adminGuard, validate(updateOrderStatusSchema), ctrl.updateOrderStatus);

export default router;
