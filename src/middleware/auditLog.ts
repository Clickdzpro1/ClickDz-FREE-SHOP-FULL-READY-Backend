import { Request, Response, NextFunction } from "express";
import { auditLogService } from "../services/auditLog.service";

/**
 * Middleware factory for audit logging.
 * Logs the action after the response is sent (non-blocking).
 */
export function auditLog(action: string, entity: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Capture the original json method
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      // Log asynchronously (fire-and-forget)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        auditLogService.log({
          userId: req.user?.userId,
          action,
          entity,
          entityId: req.params.id || req.params.entityId || undefined,
          changes: req.method !== "GET" ? req.body : undefined,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers["user-agent"],
        }).catch(() => {}); // Silently fail — audit should never break the request
      }

      return originalJson(body);
    };

    next();
  };
}
