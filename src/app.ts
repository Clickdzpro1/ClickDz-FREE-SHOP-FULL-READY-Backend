import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { config } from "./config";
import { morganStream } from "./config/logger";
import { requestId } from "./middleware/requestId";
import { locale } from "./middleware/locale";
import { rateLimit } from "./middleware/rateLimiter";
import { notFound, errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: config.app.frontendUrl || "*",
    credentials: true,
  })
);

// Request ID tracking
app.use(requestId);

// Logging
if (config.app.nodeEnv !== "test") {
  app.use(morgan("combined", { stream: morganStream }));
}

// Body parsing
// Raw body for webhooks — must come before express.json()
app.use("/api/v1/payments/webhooks", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Locale detection
app.use(locale);

// Rate limiting
app.use(rateLimit);

// Static files (uploads)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// API routes
app.use("/api/v1", routes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
