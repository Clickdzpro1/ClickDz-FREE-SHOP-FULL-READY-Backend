import { z } from "zod";

export const addWishlistItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

export const removeWishlistItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});
