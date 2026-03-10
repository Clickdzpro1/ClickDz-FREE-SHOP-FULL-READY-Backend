import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { error } from "../utils/apiResponse";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json(error("Authentication required", 401));
    return;
  }

  const token = header.substring(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json(error("Invalid or expired token", 401));
  }
}

/**
 * Optional authentication — attaches user if token present, but doesn't fail.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    try {
      const token = header.substring(7);
      req.user = verifyAccessToken(token);
    } catch {
      // Token invalid — proceed without user
    }
  }

  next();
}
