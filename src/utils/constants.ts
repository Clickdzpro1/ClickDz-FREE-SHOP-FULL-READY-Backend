// Currency
export const DEFAULT_CURRENCY = "DZD";

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Auth
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

// Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const MAX_IMAGES_PER_PRODUCT = 10;

// Order
export const ORDER_NUMBER_PREFIX = "DZ";

// Shipping
export const FREE_SHIPPING_THRESHOLD = 10000; // 10,000 DZD

// Review
export const MIN_RATING = 1;
export const MAX_RATING = 5;

// Rate Limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const AUTH_RATE_LIMIT_MAX = 10; // Stricter for auth endpoints

// Cache TTL (seconds)
export const CACHE_TTL = {
  WILAYAS: 86400, // 24 hours
  COMMUNES: 86400,
  CATEGORIES: 3600, // 1 hour
  PRODUCTS: 300, // 5 minutes
  SETTINGS: 3600,
  SHIPPING_RATES: 3600,
} as const;

// Order Status Transitions (valid next statuses)
export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["IN_TRANSIT", "DELIVERED", "RETURNED"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  RETURNED: [],
  CANCELLED: [],
};
