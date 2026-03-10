import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
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

  // Prisma known request errors (proper import-based detection)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = err.meta?.target;
      const field = Array.isArray(target) ? target[0] : "field";
      res.status(409).json(error(`A record with this ${field} already exists`, 409));
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json(error("Record not found", 404));
      return;
    }
    if (err.code === "P2003") {
      res.status(400).json(error("Related record not found (foreign key constraint)", 400));
      return;
    }
    if (err.code === "P2014") {
      res.status(400).json(error("Invalid data: required relation violation", 400));
      return;
    }
  }

  // Prisma validation error
  if (err instanceof Prisma.PrismaClientValidationError) {
    const message = process.env.NODE_ENV === "production"
      ? "Invalid data provided"
      : err.message;
    res.status(400).json(error(message, 400));
    return;
  }

  // Zod validation errors (from middleware)
  if (err.name === "ZodError") {
    res.status(400).json(error("Validation error", 400));
    return;
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

  // Multer file upload errors
  if (err.name === "MulterError") {
    const multerErr = err as any;
    if (multerErr.code === "LIMIT_FILE_SIZE") {
      res.status(400).json(error("File too large", 400));
      return;
    }
    res.status(400).json(error(`Upload error: ${multerErr.message}`, 400));
    return;
  }

  // Default 500
  const message =
    process.env.NODE_ENV === "production" ? "Internal server error" : err.message;
  res.status(500).json(error(message, 500));
}
