import { z } from "zod";

export const createGiftCardSchema = z.object({
  balance: z.number().min(100, "Minimum gift card amount is 100 DZD"),
  expiresAt: z.string().datetime().optional(),
  recipientEmail: z.string().email().optional(),
});

export const redeemGiftCardSchema = z.object({
  code: z.string().min(1, "Gift card code is required"),
  amount: z.number().min(1, "Amount must be positive"),
});
