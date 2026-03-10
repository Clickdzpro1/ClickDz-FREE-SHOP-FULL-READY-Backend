import { Request, Response } from "express";
import { newsletterService } from "../services/newsletter.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const result = await newsletterService.subscribe(req.body.email, req.body.name);
  res.json(success(result, "Subscribed to newsletter"));
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  await newsletterService.unsubscribe(req.body.email);
  res.json(success(null, "Unsubscribed from newsletter"));
});

// Admin
export const listSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const result = await newsletterService.list(page, limit);
  res.json(success(result));
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await newsletterService.getStats();
  res.json(success(result));
});

export const exportEmails = asyncHandler(async (req: Request, res: Response) => {
  const emails = await newsletterService.exportEmails();
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=newsletter-subscribers.csv");
  res.send("email,name,subscribedAt\n" + emails.map((e: any) => `${e.email},${e.name || ""},${e.createdAt}`).join("\n"));
});
