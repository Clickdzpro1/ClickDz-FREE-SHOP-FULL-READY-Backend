import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { error } from "../utils/apiResponse";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function notFound(req: Request, res: Response, _next: NextFunction) {
  res.status(404).json(error(`Route ${req.method} ${req.path} not found`, 404));
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.requestId,
  });

  // Known operational error
  if (err instanceof AppError) {
    res.status(err.statusCode).json(error(err.message, err.statusCode));
    return;
  }

  // Prisma known errors
  if (err.constructor.name === "PrismaClientKnownRequestError") {
    const prismaError = err as unknown as { code: string; meta?: { target?: string[] } };
    if (prismaError.code === "P2002") {
      const field = prismaError.meta?.target?.[0] || "field";
      res.status(409).json(error(`A record with this ${field} already exists`, 409));
      return;
    }
    if (prismaError.code === "P2025") {
      res.status(404).json(error("Record not found", 404));
      return;
    }
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json(error("Invalid token", 401));
    return;
  }
  if (err.name === "TokenExpiredError") {
    res.status(401).json(error("Token expired", 401));
    return;
  }

  // Default 500
  const message =
    process.env.NODE_ENV === "production" ? "Internal server error" : err.message;
  res.status(500).json(error(message, 500));
}
