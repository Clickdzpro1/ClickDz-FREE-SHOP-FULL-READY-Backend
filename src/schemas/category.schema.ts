import { z } from "zod";

export const createCategorySchema = z.object({
  slug: z.string().min(1).max(200).optional(),
  nameAr: z.string().min(1, "Arabic name is required").max(200),
  nameFr: z.string().min(1, "French name is required").max(200),
  nameEn: z.string().min(1, "English name is required").max(200),
  descriptionAr: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  image: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  parentId: z.string().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
