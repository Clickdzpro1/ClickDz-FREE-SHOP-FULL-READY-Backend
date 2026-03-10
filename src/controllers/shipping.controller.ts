import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";
import { shippingService } from "../services/shipping/shipping.service";
import { ShippingProviderKey } from "../services/shipping/shipping.factory";

export const getShippingRates = asyncHandler(async (req: Request, res: Response) => {
  const wilayaCode = parseInt(req.params.wilayaCode, 10);
  if (isNaN(wilayaCode)) {
    res.status(400).json({ success: false, message: "Invalid wilaya code" });
    return;
  }
  const rates = await shippingService.getRates(wilayaCode);
  res.json(success(rates));
});

export const listProviders = asyncHandler(async (_req: Request, res: Response) => {
  const providers = shippingService.listProviders();
  res.json(success(providers));
});

export const createShipment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { provider } = req.body;
  const result = await shippingService.createShipment(orderId, provider as ShippingProviderKey);
  res.status(201).json(success(result, "Shipment created"));
});

export const trackShipment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await shippingService.track(orderId);
  res.json(success(result));
});

export const cancelShipment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await shippingService.cancelShipment(orderId);
  res.json(success(result));
});

export const getShippingLabel = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const labelUrl = await shippingService.getLabel(orderId);
  res.json(success({ labelUrl }));
});
