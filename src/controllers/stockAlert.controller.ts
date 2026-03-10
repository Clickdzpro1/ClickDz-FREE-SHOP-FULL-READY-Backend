import { Request, Response } from "express";
import { stockAlertService } from "../services/stockAlert.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const result = await stockAlertService.subscribe(
    req.user!.userId,
    req.body.productId,
    req.body.variantId
  );
  res.json(success(result, "Subscribed to stock alerts"));
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  await stockAlertService.unsubscribe(
    req.user!.userId,
    req.body.productId,
    req.body.variantId
  );
  res.json(success(null, "Unsubscribed from stock alerts"));
});

export const getMyAlerts = asyncHandler(async (req: Request, res: Response) => {
  const result = await stockAlertService.getUserAlerts(req.user!.userId);
  res.json(success(result));
});
