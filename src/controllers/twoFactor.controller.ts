import { Request, Response } from "express";
import { twoFactorService } from "../services/twoFactor.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const setup = asyncHandler(async (req: Request, res: Response) => {
  const result = await twoFactorService.setup(req.user!.userId);
  res.json(success(result, "Scan the QR code with your authenticator app"));
});

export const verify = asyncHandler(async (req: Request, res: Response) => {
  await twoFactorService.verify(req.user!.userId, req.body.token);
  res.json(success(null, "Two-factor authentication enabled"));
});

export const disable = asyncHandler(async (req: Request, res: Response) => {
  await twoFactorService.disable(req.user!.userId, req.body.token);
  res.json(success(null, "Two-factor authentication disabled"));
});

export const validateLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await twoFactorService.validateLogin(req.body.userId, req.body.token);
  res.json(success(result));
});
