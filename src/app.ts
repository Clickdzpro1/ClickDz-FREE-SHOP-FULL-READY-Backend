import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import path from "path";
import fs from "fs";
import { config } from "./config";
import { morganStream } from "./config/logger";
import { requestId } from "./middleware/requestId";
import { locale } from "./middleware/locale";
import { rateLimit } from "./middleware/rateLimiter";
import { notFound, errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app = express();

// Trust proxy (required behind Nginx/Traefik for correct IP, rate limiting, etc.)
app.set("trust proxy", 1);

// Security
app.use(helmet());

// CORS — support multiple origins via comma-separated CORS_ORIGINS env
const allowedOrigins = config.app.corsOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length === 1 && allowedOrigins[0] === "*"
      ? "*"
      : (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
    credentials: true,
  })
);

// Compression
app.use(compression());

// Request ID tracking
app.use(requestId);

// Logging
if (config.app.nodeEnv !== "test") {
  app.use(morgan("combined", { stream: morganStream }));
}

// Body parsing
// Raw body for webhooks — must come before express.json()
app.use("/api/v1/payments/webhooks", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Locale detection
app.use(locale);

// Rate limiting
app.use(rateLimit);

// Ensure upload directory exists
const uploadDir = path.resolve(config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Static files (uploads) — only product images
// Payment proofs should be served through an authenticated admin endpoint
app.use("/uploads", express.static(uploadDir, {
  dotfiles: "deny",
  index: false,
}));

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
