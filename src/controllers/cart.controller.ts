import { Request, Response } from "express";
import { cartService } from "../services/cart.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const result = await cartService.getOrCreateCart(req.user!.userId);
  res.json(success(result));
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const result = await cartService.addItem(req.user!.userId, req.body);
  res.json(success(result, "Item added to cart"));
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const result = await cartService.updateItemQuantity(
    req.user!.userId,
    req.params.itemId,
    req.body.quantity
  );
  res.json(success(result, "Cart updated"));
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const result = await cartService.removeItem(req.user!.userId, req.params.itemId);
  res.json(success(result, "Item removed from cart"));
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await cartService.clearCart(req.user!.userId);
  res.json(success(null, "Cart cleared"));
});
