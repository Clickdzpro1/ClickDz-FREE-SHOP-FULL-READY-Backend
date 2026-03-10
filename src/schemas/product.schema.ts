import { z } from "zod";

export const createProductSchema = z.object({
  slug: z.string().min(1).max(200).optional(),
  sku: z.string().max(100).optional(),
  nameAr: z.string().min(1, "Arabic name is required").max(200),
  nameFr: z.string().min(1, "French name is required").max(200),
  nameEn: z.string().min(1, "English name is required").max(200),
  descriptionAr: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  trackInventory: z.boolean().default(true),
  weight: z.number().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        sku: z.string().optional(),
        price: z.number().positive(),
        stock: z.number().int().min(0).default(0),
        attributes: z.record(z.string()).default({}),
      })
    )
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.enum(["createdAt", "price", "name", "stock"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  isFeatured: z.string().optional(),
  isActive: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
