import { redis } from "../config/redis";
import { logger } from "../config/logger";

const DEFAULT_TTL = 300; // 5 minutes

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      logger.warn(`Cache get error for key ${key}:`, err);
      return null;
    }
  },

  async set(key: string, data: any, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(data), "EX", ttl);
    } catch (err) {
      logger.warn(`Cache set error for key ${key}:`, err);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (err) {
      logger.warn(`Cache del error for key ${key}:`, err);
    }
  },

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      logger.warn(`Cache delPattern error for ${pattern}:`, err);
    }
  },

  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl: number = DEFAULT_TTL): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  },

  async flush(): Promise<void> {
    try {
      await redis.flushdb();
    } catch (err) {
      logger.warn("Cache flush error:", err);
    }
  },

  // Common cache key builders
  keys: {
    product: (id: string) => `product:${id}`,
    productList: (page: number, limit: number) => `products:list:${page}:${limit}`,
    category: (id: string) => `category:${id}`,
    categoryTree: () => "categories:tree",
    wilayas: () => "geo:wilayas",
    communes: (wilayaId: number) => `geo:communes:${wilayaId}`,
    shippingRates: (wilayaCode: number) => `shipping:rates:${wilayaCode}`,
    settings: () => "settings:store",
  },
};
