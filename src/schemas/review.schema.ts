import { z } from "zod";
import { MIN_RATING, MAX_RATING } from "../utils/constants";

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(MIN_RATING).max(MAX_RATING),
  comment: z.string().max(1000).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(MIN_RATING).max(MAX_RATING).optional(),
  comment: z.string().max(1000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
