import { Request, Response } from "express";
import { addressService } from "../services/address.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const listAddresses = asyncHandler(async (req: Request, res: Response) => {
  const result = await addressService.list(req.user!.userId);
  res.json(success(result));
});

export const getAddress = asyncHandler(async (req: Request, res: Response) => {
  const result = await addressService.getById(req.user!.userId, req.params.id);
  res.json(success(result));
});

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const result = await addressService.create(req.user!.userId, req.body);
  res.status(201).json(success(result, "Address created", 201));
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const result = await addressService.update(req.user!.userId, req.params.id, req.body);
  res.json(success(result, "Address updated"));
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  await addressService.delete(req.user!.userId, req.params.id);
  res.json(success(null, "Address deleted"));
});

export const setDefaultAddress = asyncHandler(async (req: Request, res: Response) => {
  const result = await addressService.setDefault(req.user!.userId, req.params.id);
  res.json(success(result, "Default address set"));
});
