import app from "./app";
import { config } from "./config";
import { logger } from "./config/logger";
import { prisma } from "./config/database";

const PORT = config.app.port;

async function start() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info("Database connected");

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${config.app.nodeEnv} mode`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API base: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

start();
