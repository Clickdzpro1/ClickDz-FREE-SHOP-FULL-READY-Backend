import { Request, Response, NextFunction } from "express";
import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "../config/redis";
import { config } from "../config";
import { error } from "../utils/apiResponse";

let rateLimiter: RateLimiterMemory | RateLimiterRedis;

// Try Redis-backed limiter, fall back to in-memory
if (redis) {
  rateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "rl",
    points: config.rateLimit.maxRequests,
    duration: config.rateLimit.windowMs / 1000,
  });
} else {
  rateLimiter = new RateLimiterMemory({
    points: config.rateLimit.maxRequests,
    duration: config.rateLimit.windowMs / 1000,
  });
}

// Stricter limiter for auth endpoints
const authLimiter = new RateLimiterMemory({
  points: 10,
  duration: 15 * 60, // 15 minutes
  blockDuration: 15 * 60, // Block for 15 minutes after exceeded
});

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || "unknown";

  rateLimiter
    .consume(key)
    .then(() => next())
    .catch(() => {
      res.status(429).json(error("Too many requests, please try again later", 429));
    });
}

export function authRateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || "unknown";

  authLimiter
    .consume(key)
    .then(() => next())
    .catch(() => {
      res.status(429).json(
        error("Too many authentication attempts, please try again later", 429)
      );
    });
}
