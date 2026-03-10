import { Request, Response } from "express";
import { returnService } from "../services/return.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const createReturn = asyncHandler(async (req: Request, res: Response) => {
  const result = await returnService.create(req.user!.userId, req.body);
  res.status(201).json(success(result, "Return request submitted"));
});

export const getMyReturns = asyncHandler(async (req: Request, res: Response) => {
  const result = await returnService.getByUser(req.user!.userId);
  res.json(success(result));
});

export const getReturnById = asyncHandler(async (req: Request, res: Response) => {
  const result = await returnService.getById(req.params.id, req.user!.userId);
  res.json(success(result));
});

// Admin
export const listAllReturns = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await returnService.listAll({ status: status as any, page, limit });
  res.json(success(result));
});

export const updateReturnStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await returnService.updateStatus(req.params.id, {
    status: req.body.status,
    adminNote: req.body.adminNote,
    refundAmount: req.body.refundAmount,
    trackingNumber: req.body.trackingNumber,
  });
  res.json(success(result, "Return status updated"));
});
