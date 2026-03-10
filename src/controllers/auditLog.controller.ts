import { Request, Response } from "express";
import { auditLogService } from "../services/auditLog.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const { entity, action, userId, from, to, page, limit } = req.query;
  const result = await auditLogService.listAll({
    entity: entity as string,
    action: action as string,
    userId: userId as string,
    from: from ? new Date(from as string) : undefined,
    to: to ? new Date(to as string) : undefined,
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 50,
  });
  res.json(success(result));
});

export const getEntityLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await auditLogService.getByEntity(req.params.entity, req.params.entityId, page, limit);
  res.json(success(result));
});
