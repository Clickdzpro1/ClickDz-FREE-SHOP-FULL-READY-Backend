import { Request, Response } from "express";
import { reviewService } from "../services/review.service";
import { success, paginated } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const listReviews = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.listByProduct(
    req.params.productId,
    req.query as Record<string, string>
  );
  res.json({ ...paginated(result.data, result.pagination), stats: result.stats });
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.create(req.user!.userId, req.body);
  res.status(201).json(success(result, "Review submitted for approval", 201));
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.update(req.user!.userId, req.params.id, req.body);
  res.json(success(result, "Review updated"));
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  await reviewService.delete(req.user!.userId, req.params.id);
  res.json(success(null, "Review deleted"));
});

// Admin
export const listPendingReviews = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.listPending(req.query as Record<string, string>);
  res.json(paginated(result.data, result.pagination));
});

export const approveReview = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.approve(req.params.id);
  res.json(success(result, "Review approved"));
});

export const adminDeleteReview = asyncHandler(async (req: Request, res: Response) => {
  await reviewService.adminDelete(req.params.id);
  res.json(success(null, "Review deleted"));
});
