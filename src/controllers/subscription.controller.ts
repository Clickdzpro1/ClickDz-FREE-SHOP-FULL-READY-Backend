import { Request, Response } from "express";
import { subscriptionService } from "../services/subscription.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const createSubscription = asyncHandler(async (req: Request, res: Response) => {
  const result = await subscriptionService.create(req.user!.userId, req.body);
  res.status(201).json(success(result, "Subscription created"));
});

export const getMySubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const result = await subscriptionService.getByUser(req.user!.userId);
  res.json(success(result));
});

export const pauseSubscription = asyncHandler(async (req: Request, res: Response) => {
  const result = await subscriptionService.pause(req.params.id, req.user!.userId);
  res.json(success(result, "Subscription paused"));
});

export const resumeSubscription = asyncHandler(async (req: Request, res: Response) => {
  const result = await subscriptionService.resume(req.params.id, req.user!.userId);
  res.json(success(result, "Subscription resumed"));
});

export const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
  const result = await subscriptionService.cancel(req.params.id, req.user!.userId);
  res.json(success(result, "Subscription cancelled"));
});

export const updateInterval = asyncHandler(async (req: Request, res: Response) => {
  const result = await subscriptionService.updateInterval(
    req.params.id,
    req.user!.userId,
    req.body.interval
  );
  res.json(success(result, "Subscription interval updated"));
});

// Admin
export const processDue = asyncHandler(async (_req: Request, res: Response) => {
  const result = await subscriptionService.processDueSubscriptions();
  res.json(success(result, `Processed ${result.length} due subscriptions`));
});
