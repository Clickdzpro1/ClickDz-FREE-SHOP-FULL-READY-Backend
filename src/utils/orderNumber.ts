import crypto from "crypto";

/**
 * Generate a human-readable order number using crypto-safe randomness.
 * Format: DZ-YYYYMMDD-XXXXXX (e.g., DZ-20240315-A7K2B9)
 * 6 chars from a 30-character alphabet = ~729M combinations per day.
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion
  const bytes = crypto.randomBytes(6);
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(bytes[i] % chars.length);
  }
  return `DZ-${date}-${suffix}`;
}
