import { Request, Response, NextFunction } from "express";
import { error } from "../utils/apiResponse";

/**
 * Requires the user to have ADMIN or SUPER_ADMIN role.
 * Must be used after authenticate middleware.
 */
export function adminGuard(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json(error("Authentication required", 401));
    return;
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    res.status(403).json(error("Admin access required", 403));
    return;
  }

  next();
}

/**
 * Requires SUPER_ADMIN role specifically.
 */
export function superAdminGuard(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json(error("Authentication required", 401));
    return;
  }

  if (req.user.role !== "SUPER_ADMIN") {
    res.status(403).json(error("Super admin access required", 403));
    return;
  }

  next();
}
