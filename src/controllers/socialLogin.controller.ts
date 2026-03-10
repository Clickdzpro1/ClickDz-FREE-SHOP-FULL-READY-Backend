import { Request, Response } from "express";
import { socialLoginService } from "../services/socialLogin.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getLinkedAccounts = asyncHandler(async (req: Request, res: Response) => {
  const result = await socialLoginService.getLinkedAccounts(req.user!.userId);
  res.json(success(result));
});

export const unlinkAccount = asyncHandler(async (req: Request, res: Response) => {
  await socialLoginService.unlinkAccount(req.user!.userId, req.params.provider);
  res.json(success(null, "Social account unlinked"));
});
