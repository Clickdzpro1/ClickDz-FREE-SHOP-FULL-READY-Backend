import { z } from "zod";

export const createReturnSchema = z.object({
  orderId: z.string().min(1),
  reason: z.enum(["DEFECTIVE", "WRONG_ITEM", "NOT_AS_DESCRIBED", "CHANGED_MIND", "OTHER"]),
  description: z.string().max(1000).optional(),
});

export const updateReturnStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "SHIPPED_BACK", "RECEIVED", "REFUNDED", "CLOSED"]),
  adminNote: z.string().max(500).optional(),
});
