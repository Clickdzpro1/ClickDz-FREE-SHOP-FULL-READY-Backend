import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().min(1, "Shipping address is required"),
  paymentMethod: z.enum([
    "COD",
    "CHARGILY_EDAHABIA",
    "CHARGILY_CIB",
    "SLICKPAY_EDAHABIA",
    "SLICKPAY_CIB",
    "STRIPE",
    "CCP_BARIDIMOB",
  ]),
  shippingProvider: z.enum([
    "YALIDINE",
    "ZR_EXPRESS",
    "EMS_POSTE",
    "MAYSTRO",
    "MANUAL",
  ]).optional(),
  couponCode: z.string().optional(),
  customerNote: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "RETURNED",
    "CANCELLED",
  ]),
  note: z.string().max(500).optional(),
  trackingNumber: z.string().max(100).optional(),
});

export const orderQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.enum(["createdAt", "total", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
