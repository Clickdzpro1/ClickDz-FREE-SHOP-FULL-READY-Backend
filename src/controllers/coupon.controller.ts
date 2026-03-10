import { Request, Response } from "express";
import { couponService } from "../services/coupon.service";
import { success, paginated } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

// Customer
export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const result = await couponService.validate(req.body.code);
  res.json(success(result, "Coupon is valid"));
});

// Admin
export const listCoupons = asyncHandler(async (req: Request, res: Response) => {
  const result = await couponService.list(req.query as Record<string, string>);
  res.json(paginated(result.data, result.pagination));
});

export const getCoupon = asyncHandler(async (req: Request, res: Response) => {
  const result = await couponService.getById(req.params.id);
  res.json(success(result));
});

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const result = await couponService.create(req.body);
  res.status(201).json(success(result, "Coupon created", 201));
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const result = await couponService.update(req.params.id, req.body);
  res.json(success(result, "Coupon updated"));
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  await couponService.delete(req.params.id);
  res.json(success(null, "Coupon deleted"));
});
