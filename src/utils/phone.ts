/**
 * Format Algerian phone numbers to international format.
 * Accepts: 0555123456, +213555123456, 213555123456, 05 55 12 34 56
 * Returns: +213555123456
 */
export function formatAlgerianPhone(phone: string): string {
  // Remove spaces, dashes, dots
  let cleaned = phone.replace(/[\s\-.()]/g, "");

  // Remove leading +
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // If starts with 213, ensure it's correct length
  if (cleaned.startsWith("213")) {
    cleaned = cleaned.substring(3);
  }

  // Remove leading 0
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  return `+213${cleaned}`;
}

/**
 * Validate Algerian phone number format.
 * Valid mobile prefixes: 5, 6, 7
 * Valid landline prefixes: 2, 3, 4
 */
export function isValidAlgerianPhone(phone: string): boolean {
  const formatted = formatAlgerianPhone(phone);
  // +213 followed by 9 digits, starting with valid prefix
  return /^\+213[2-7]\d{8}$/.test(formatted);
}
