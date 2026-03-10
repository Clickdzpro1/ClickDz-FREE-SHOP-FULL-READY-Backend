import { Request, Response } from "express";
import { vendorService } from "../services/vendor.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const applyAsVendor = asyncHandler(async (req: Request, res: Response) => {
  const result = await vendorService.apply(req.user!.userId, req.body);
  res.status(201).json(success(result, "Vendor application submitted"));
});

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await vendorService.getProfile(req.user!.userId);
  res.json(success(result));
});

export const getStoreBySlug = asyncHandler(async (req: Request, res: Response) => {
  const result = await vendorService.getBySlug(req.params.slug);
  res.json(success(result));
});

export const listPublicStores = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await vendorService.listPublic(page, limit);
  res.json(success(result));
});

export const addProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = await vendorService.addProduct(req.user!.userId, req.body.productId);
  res.json(success(result, "Product added to store"));
});

export const removeProduct = asyncHandler(async (req: Request, res: Response) => {
  await vendorService.removeProduct(req.user!.userId, req.params.productId);
  res.json(success(null, "Product removed from store"));
});

// Admin
export const listAllVendors = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as any;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await vendorService.listAll(status, page, limit);
  res.json(success(result));
});

export const updateVendorStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await vendorService.updateStatus(req.params.id, req.body.status);
  res.json(success(result, "Vendor status updated"));
});

export const updateCommission = asyncHandler(async (req: Request, res: Response) => {
  const result = await vendorService.updateCommission(req.params.id, req.body.commissionRate);
  res.json(success(result, "Commission rate updated"));
});
