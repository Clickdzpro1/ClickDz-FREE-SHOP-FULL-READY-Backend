import { Request, Response } from "express";
import { bundleService } from "../services/bundle.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const listBundles = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await bundleService.list(page, limit);
  res.json(success(result));
});

export const getBundleBySlug = asyncHandler(async (req: Request, res: Response) => {
  const result = await bundleService.getBySlug(req.params.slug);
  res.json(success(result));
});

// Admin
export const createBundle = asyncHandler(async (req: Request, res: Response) => {
  const result = await bundleService.create(req.body);
  res.status(201).json(success(result, "Bundle created"));
});

export const updateBundle = asyncHandler(async (req: Request, res: Response) => {
  const result = await bundleService.update(req.params.id, req.body);
  res.json(success(result, "Bundle updated"));
});

export const removeBundle = asyncHandler(async (req: Request, res: Response) => {
  await bundleService.remove(req.params.id);
  res.json(success(null, "Bundle deactivated"));
});
