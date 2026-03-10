import { z } from "zod";

export const getShippingRatesSchema = z.object({
  // wilayaCode from params
});

export const createShipmentSchema = z.object({
  provider: z.enum(["YALIDINE", "ZR_EXPRESS", "EMS_POSTE", "MAYSTRO", "MANUAL"]).optional(),
});

export const trackShipmentParamsSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});
