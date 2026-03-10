import { z } from "zod";

export const initiatePaymentSchema = z.object({
  // orderId comes from params, validated here for completeness
});

export const confirmManualPaymentSchema = z.object({
  // orderId from params
});

export const rejectManualPaymentSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const refundPaymentSchema = z.object({
  amount: z.number().positive("Refund amount must be positive").optional(),
});
