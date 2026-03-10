import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === "production"
      ? winston.format.json()
      : winston.format.combine(winston.format.colorize(), winston.format.simple())
  ),
  transports: [new winston.transports.Console()],
});

// Morgan stream adapter
export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};
