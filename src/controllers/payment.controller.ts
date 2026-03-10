import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";
import { paymentService } from "../services/payment/payment.service";
import { PaymentMethodKey } from "../services/payment/payment.factory";

export const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await paymentService.initiatePayment(orderId, req.user!.userId);
  res.json(success(result, "Payment initiated"));
});

export const getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await paymentService.checkStatus(orderId);
  res.json(success(result));
});

export const confirmManualPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await paymentService.confirmManualPayment(orderId);
  res.json(success(result, "Payment confirmed"));
});

export const rejectManualPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await paymentService.rejectManualPayment(orderId);
  res.json(success(result, "Payment rejected"));
});

export const refundPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { amount } = req.body;
  const result = await paymentService.refund(orderId, amount);
  res.json(success(result, "Refund processed"));
});

// ─── Webhook handlers ────────────────────────────────────────────────
export const chargilyWebhook = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.handleWebhook(
    "CHARGILY_EDAHABIA" as PaymentMethodKey,
    req.body as Buffer,
    req.headers as Record<string, string>
  );
  res.json({ received: true, status: result.status });
});

export const slickpayWebhook = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.handleWebhook(
    "SLICKPAY" as PaymentMethodKey,
    req.body as Buffer,
    req.headers as Record<string, string>
  );
  res.json({ received: true, status: result.status });
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.handleWebhook(
    "STRIPE" as PaymentMethodKey,
    req.body as Buffer,
    req.headers as Record<string, string>
  );
  res.json({ received: true, status: result.status });
});
