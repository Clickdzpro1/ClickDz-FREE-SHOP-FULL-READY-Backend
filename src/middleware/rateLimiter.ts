import { Request, Response, NextFunction } from "express";
import { RateLimiterMemory, RateLimiterRedis, RateLimiterAbstract } from "rate-limiter-flexible";
import { redis } from "../config/redis";
import { config } from "../config";
import { error } from "../utils/apiResponse";
import { logger } from "../config/logger";

// Lazy init — actual rate limiter is created on first request
// This avoids issues with Redis not being connected at module load time
let _rateLimiter: RateLimiterAbstract | null = null;
let _authLimiter: RateLimiterAbstract | null = null;

function getRateLimiter(): RateLimiterAbstract {
  if (_rateLimiter) return _rateLimiter;

  // Try Redis-backed limiter if connected
  if (redis && redis.status === "ready") {
    try {
      _rateLimiter = new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: "rl",
        points: config.rateLimit.maxRequests,
        duration: config.rateLimit.windowMs / 1000,
      });
      logger.info("Rate limiter: using Redis backend");
      return _rateLimiter;
    } catch {
      // Fall through to memory
    }
  }

  _rateLimiter = new RateLimiterMemory({
    points: config.rateLimit.maxRequests,
    duration: config.rateLimit.windowMs / 1000,
  });
  logger.info("Rate limiter: using in-memory backend");
  return _rateLimiter;
}

function getAuthLimiter(): RateLimiterAbstract {
  if (_authLimiter) return _authLimiter;

  // Try Redis-backed limiter for auth
  if (redis && redis.status === "ready") {
    try {
      _authLimiter = new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: "rl_auth",
        points: config.rateLimit.authMax,
        duration: 15 * 60, // 15 minutes
        blockDuration: 15 * 60,
      });
      return _authLimiter;
    } catch {
      // Fall through to memory
    }
  }

  _authLimiter = new RateLimiterMemory({
    points: config.rateLimit.authMax,
    duration: 15 * 60,
    blockDuration: 15 * 60,
  });
  return _authLimiter;
}

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || "unknown";

  getRateLimiter()
    .consume(key)
    .then(() => next())
    .catch(() => {
      res.status(429).json(error("Too many requests, please try again later", 429));
    });
}

export function authRateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || "unknown";

  getAuthLimiter()
    .consume(key)
    .then(() => next())
    .catch(() => {
      res.status(429).json(
        error("Too many authentication attempts, please try again later", 429)
      );
    });
}
