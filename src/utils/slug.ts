/**
 * Generate a URL-friendly slug from a string.
 * Handles Latin and basic transliteration.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric
    .replace(/[\s_]+/g, "-") // Spaces/underscores to hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens from ends
}

/**
 * Generate a unique slug by appending a random suffix.
 */
export function uniqueSlug(text: string): string {
  const base = slugify(text);
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}
