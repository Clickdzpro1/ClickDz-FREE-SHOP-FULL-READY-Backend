import { z } from "zod";

export const createBundleSchema = z.object({
  slug: z.string().min(1),
  nameAr: z.string().min(1),
  nameFr: z.string().min(1),
  nameEn: z.string().min(1),
  descriptionAr: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.number().min(0),
  image: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).default(1),
  })).min(1, "At least one item is required"),
});

export const updateBundleSchema = z.object({
  nameAr: z.string().optional(),
  nameFr: z.string().optional(),
  nameEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.number().min(0).optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});
