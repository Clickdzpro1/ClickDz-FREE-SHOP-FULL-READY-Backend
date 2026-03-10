import { Request, Response } from "express";
import { webhookService } from "../services/webhook.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const createWebhook = asyncHandler(async (req: Request, res: Response) => {
  const result = await webhookService.create(req.user!.userId, req.body);
  res.status(201).json(success(result, "Webhook endpoint created"));
});

export const listWebhooks = asyncHandler(async (req: Request, res: Response) => {
  const result = await webhookService.list(req.user!.userId);
  res.json(success(result));
});

export const updateWebhook = asyncHandler(async (req: Request, res: Response) => {
  const result = await webhookService.update(req.params.id, req.user!.userId, req.body);
  res.json(success(result, "Webhook endpoint updated"));
});

export const removeWebhook = asyncHandler(async (req: Request, res: Response) => {
  await webhookService.remove(req.params.id, req.user!.userId);
  res.json(success(null, "Webhook endpoint deleted"));
});

export const getDeliveries = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await webhookService.getDeliveries(req.params.id, req.user!.userId, page, limit);
  res.json(success(result));
});
