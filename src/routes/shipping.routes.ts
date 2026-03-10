import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { adminGuard } from "../middleware/adminGuard";
import {
  getShippingRates,
  listProviders,
  createShipment,
  trackShipment,
  cancelShipment,
  getShippingLabel,
} from "../controllers/shipping.controller";

const router = Router();

// ─── Public ──────────────────────────────────────────────────────────
router.get("/providers", listProviders);
router.get("/rates/:wilayaCode", getShippingRates);

// ─── Customer ────────────────────────────────────────────────────────
router.get("/track/:orderId", authenticate, trackShipment);

// ─── Admin ───────────────────────────────────────────────────────────
router.post("/shipments/:orderId", authenticate, adminGuard, createShipment);
router.post("/shipments/:orderId/cancel", authenticate, adminGuard, cancelShipment);
router.get("/shipments/:orderId/label", authenticate, adminGuard, getShippingLabel);

export default router;
