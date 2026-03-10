import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(50).toUpperCase(),
  descriptionAr: z.string().optional(),
  descriptionFr: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.number().positive("Value must be positive"),
  minOrderAmount: z.number().positive().optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
