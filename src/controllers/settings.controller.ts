import { Request, Response } from "express";
import { settingsService } from "../services/settings.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const result = await settingsService.getAll();
  res.json(success(result));
});

export const getSetting = asyncHandler(async (req: Request, res: Response) => {
  const result = await settingsService.get(req.params.key);
  res.json(success(result));
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  await settingsService.setMany(req.body);
  res.json(success(null, "Settings updated"));
});
