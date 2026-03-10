import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { adminGuard } from "../middleware/adminGuard";
import {
  getDashboard,
  listCustomers,
  getCustomerDetail,
  exportOrders,
  listShippingRates,
  upsertShippingRate,
  deleteShippingRate,
} from "../controllers/admin.controller";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, adminGuard);

// Dashboard
router.get("/dashboard", getDashboard);

// Customers
router.get("/customers", listCustomers);
router.get("/customers/:id", getCustomerDetail);

// Orders export
router.get("/orders/export", exportOrders);

// Shipping rates
router.get("/shipping-rates", listShippingRates);
router.post("/shipping-rates", upsertShippingRate);
router.delete("/shipping-rates/:id", deleteShippingRate);

export default router;
