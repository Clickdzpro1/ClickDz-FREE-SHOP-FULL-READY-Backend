import { z } from "zod";

export const bulkUpdatePricesSchema = z.object({
  updates: z.array(z.object({
    productId: z.string().min(1),
    price: z.number().min(0),
  })).min(1).max(100),
});

export const bulkUpdateStockSchema = z.object({
  updates: z.array(z.object({
    productId: z.string().min(1),
    stock: z.number().int().min(0),
  })).min(1).max(100),
});

export const bulkProductIdsSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(100),
});

export const bulkOrderStatusSchema = z.object({
  orderIds: z.array(z.string().min(1)).min(1).max(50),
  status: z.string().min(1),
});

export const bulkDeleteReviewsSchema = z.object({
  reviewIds: z.array(z.string().min(1)).min(1).max(50),
});

export const bulkImportProductsSchema = z.object({
  products: z.array(z.object({
    nameEn: z.string().min(1),
    nameFr: z.string().min(1),
    nameAr: z.string().min(1),
    slug: z.string().min(1),
    price: z.number().min(0),
    stock: z.number().int().min(0),
    categoryId: z.string().min(1),
    sku: z.string().optional(),
    descriptionEn: z.string().optional(),
    descriptionFr: z.string().optional(),
    descriptionAr: z.string().optional(),
  })).min(1).max(100),
});

export const twoFactorSetupSchema = z.object({
  token: z.string().length(6, "Token must be 6 digits"),
});

export const twoFactorVerifySchema = z.object({
  userId: z.string().min(1),
  token: z.string().min(6).max(8),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const stockAlertSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
});
