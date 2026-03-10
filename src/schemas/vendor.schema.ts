import { z } from "zod";

export const applyVendorSchema = z.object({
  storeName: z.string().min(2).max(100),
  storeNameAr: z.string().optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().max(1000).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  address: z.string().max(200).optional(),
  wilayaId: z.number().int().min(1).max(58).optional(),
});

export const updateVendorStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]),
});

export const updateCommissionSchema = z.object({
  commissionRate: z.number().min(0).max(100),
});

export const addVendorProductSchema = z.object({
  productId: z.string().min(1),
});
