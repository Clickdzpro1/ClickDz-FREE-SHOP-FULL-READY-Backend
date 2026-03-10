import { Request, Response } from "express";
import { giftCardService } from "../services/giftCard.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const createGiftCard = asyncHandler(async (req: Request, res: Response) => {
  const result = await giftCardService.create({
    initialBalance: req.body.balance,
    purchasedById: req.user!.userId,
    recipientEmail: req.body.recipientEmail,
    recipientName: req.body.recipientName,
    message: req.body.message,
    expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
  });
  res.status(201).json(success(result, "Gift card created"));
});

export const redeemGiftCard = asyncHandler(async (req: Request, res: Response) => {
  const result = await giftCardService.redeem(req.body.code, req.body.amount, req.user!.userId);
  res.json(success(result, "Gift card redeemed"));
});

export const checkBalance = asyncHandler(async (req: Request, res: Response) => {
  const result = await giftCardService.checkBalance(req.params.code);
  res.json(success(result));
});

export const getMyGiftCards = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await giftCardService.list(page, limit);
  res.json(success(result));
});

// Admin
export const disableGiftCard = asyncHandler(async (req: Request, res: Response) => {
  const result = await giftCardService.disable(req.params.id);
  res.json(success(result, "Gift card disabled"));
});
