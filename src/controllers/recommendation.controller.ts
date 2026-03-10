import { Request, Response } from "express";
import { recommendationService } from "../services/recommendation.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getAlsoBought = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 6;
  const result = await recommendationService.getAlsoBought(req.params.productId, limit);
  res.json(success(result));
});

export const getSimilar = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 6;
  const result = await recommendationService.getSimilar(req.params.productId, limit);
  res.json(success(result));
});

export const getPersonalized = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 12;
  const result = await recommendationService.getPersonalized(req.user!.userId, limit);
  res.json(success(result));
});
