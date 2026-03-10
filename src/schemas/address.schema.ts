import { z } from "zod";

export const createAddressSchema = z.object({
  label: z.string().max(50).optional(),
  fullName: z.string().min(1, "Full name is required").max(100),
  phone: z.string().min(1, "Phone is required"),
  addressLine1: z.string().min(1, "Address is required").max(200),
  addressLine2: z.string().max(200).optional(),
  wilayaId: z.number().int().min(1, "Wilaya is required"),
  communeId: z.number().int().min(1, "Commune is required"),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
