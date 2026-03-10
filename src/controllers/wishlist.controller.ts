import { Request, Response } from "express";
import { wishlistService } from "../services/wishlist.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const result = await wishlistService.getOrCreate(req.user!.userId);
  res.json(success(result));
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const result = await wishlistService.addItem(req.user!.userId, req.body.productId);
  res.json(success(result, "Added to wishlist"));
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  await wishlistService.removeItem(req.user!.userId, req.body.productId);
  res.json(success(null, "Removed from wishlist"));
});

export const clearWishlist = asyncHandler(async (req: Request, res: Response) => {
  await wishlistService.clear(req.user!.userId);
  res.json(success(null, "Wishlist cleared"));
});

export const checkItem = asyncHandler(async (req: Request, res: Response) => {
  const inWishlist = await wishlistService.isInWishlist(req.user!.userId, req.params.productId);
  res.json(success({ inWishlist }));
});
