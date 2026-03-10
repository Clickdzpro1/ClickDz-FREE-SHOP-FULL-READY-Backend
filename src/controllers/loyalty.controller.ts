import { Request, Response } from "express";
import { loyaltyService } from "../services/loyalty.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getBalance = asyncHandler(async (req: Request, res: Response) => {
  const result = await loyaltyService.getBalance(req.user!.userId);
  res.json(success(result));
});

export const redeemPoints = asyncHandler(async (req: Request, res: Response) => {
  const result = await loyaltyService.redeemPoints(req.user!.userId, req.body.points);
  res.json(success(result, "Points redeemed successfully"));
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await loyaltyService.getHistory(req.user!.userId, page, limit);
  res.json(success(result));
});
