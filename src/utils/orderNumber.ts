/**
 * Generate a human-readable order number.
 * Format: DZ-YYYYMMDD-XXXX (e.g., DZ-20240315-A7K2)
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DZ-${date}-${suffix}`;
}
