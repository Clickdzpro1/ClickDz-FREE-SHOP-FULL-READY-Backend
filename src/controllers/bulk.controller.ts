import { Request, Response } from "express";
import { bulkService } from "../services/bulk.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const bulkUpdatePrices = asyncHandler(async (req: Request, res: Response) => {
  const result = await bulkService.updateProductPrices(req.body.updates);
  res.json(success(result, `Updated ${result.length} product prices`));
});

export const bulkUpdateStock = asyncHandler(async (req: Request, res: Response) => {
  const result = await bulkService.updateProductStock(req.body.updates);
  res.json(success(result, `Updated ${result.length} product stock levels`));
});

export const bulkDeactivateProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await bulkService.deactivateProducts(req.body.productIds);
  res.json(success(result, `Deactivated ${result.deactivated} products`));
});

export const bulkActivateProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await bulkService.activateProducts(req.body.productIds);
  res.json(success(result, `Activated ${result.activated} products`));
});

export const bulkUpdateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await bulkService.bulkUpdateOrderStatus(req.body.orderIds, req.body.status);
  res.json(success(result, `Updated ${result.length} order statuses`));
});

export const bulkDeleteReviews = asyncHandler(async (req: Request, res: Response) => {
  const result = await bulkService.deleteReviews(req.body.reviewIds);
  res.json(success(result, `Deleted ${result.deleted} reviews`));
});

export const bulkImportProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await bulkService.importProducts(req.body.products);
  res.json(success(result, `Imported ${result.length} products`));
});
