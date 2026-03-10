import Redis from "ioredis";
import { config } from "./index";
import { logger } from "./logger";

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("error", (err) => {
  logger.warn("Redis connection error (non-fatal, will retry):", err.message);
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

export async function connectRedis() {
  try {
    await redis.connect();
  } catch {
    logger.warn("Redis not available — rate limiting will use in-memory fallback");
  }
}
