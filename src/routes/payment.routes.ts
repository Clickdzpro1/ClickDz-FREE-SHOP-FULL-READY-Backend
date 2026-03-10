import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { adminGuard } from "../middleware/adminGuard";
import {
  initiatePayment,
  getPaymentStatus,
  confirmManualPayment,
  rejectManualPayment,
  refundPayment,
  chargilyWebhook,
  slickpayWebhook,
  stripeWebhook,
} from "../controllers/payment.controller";

const router = Router();

// ─── Webhooks (no auth — verified by signature) ──────────────────────
// Raw body is parsed in app.ts before JSON middleware
router.post("/webhooks/chargily", chargilyWebhook);
router.post("/webhooks/slickpay", slickpayWebhook);
router.post("/webhooks/stripe", stripeWebhook);

// ─── Customer ────────────────────────────────────────────────────────
router.post("/checkout/:orderId", authenticate, initiatePayment);
router.get("/status/:orderId", authenticate, getPaymentStatus);

// ─── Admin ───────────────────────────────────────────────────────────
router.post("/confirm/:orderId", authenticate, adminGuard, confirmManualPayment);
router.post("/reject/:orderId", authenticate, adminGuard, rejectManualPayment);
router.post("/refund/:orderId", authenticate, adminGuard, refundPayment);

export default router;
