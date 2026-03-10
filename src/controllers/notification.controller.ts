import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await notificationService.getUserNotifications(req.user!.userId, page, limit);
  res.json(success(result));
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAsRead(req.params.id, req.user!.userId);
  res.json(success(null, "Notification marked as read"));
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.user!.userId);
  res.json(success(null, "All notifications marked as read"));
});
