import http from "http";
import app from "./app";
import { config } from "./config";
import { logger } from "./config/logger";
import { prisma } from "./config/database";
import { connectRedis, redis } from "./config/redis";

const PORT = config.app.port;
let server: http.Server;

async function start() {
  try {
    // Connect database
    await prisma.$connect();
    logger.info("Database connected");

    // Connect Redis (non-fatal if unavailable)
    await connectRedis();

    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${config.app.nodeEnv} mode`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API base: http://localhost:${PORT}/api/v1`);
    });

    // Handle server errors
    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
      throw err;
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// ─── Graceful shutdown ─────────────────────────────────────────────────

async function shutdown(signal: string) {
  logger.info(`${signal} received, starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
    });
  }

  try {
    // Disconnect Redis
    if (redis && redis.status === "ready") {
      await redis.quit();
      logger.info("Redis disconnected");
    }
  } catch {
    // Ignore Redis disconnect errors
  }

  try {
    // Disconnect Prisma
    await prisma.$disconnect();
    logger.info("Database disconnected");
  } catch {
    // Ignore DB disconnect errors
  }

  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ─── Unhandled errors ──────────────────────────────────────────────────

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled Rejection:", reason);
  // Don't exit — let existing requests finish
});

process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  // Exit after logging — state may be corrupt
  shutdown("uncaughtException").catch(() => process.exit(1));
});

start();
