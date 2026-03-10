import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config = {
  app: {
    nodeEnv: optional("NODE_ENV", "development"),
    port: parseInt(optional("PORT", "3000"), 10),
    baseUrl: optional("APP_BASE_URL", "http://localhost:3000"),
    frontendUrl: optional("FRONTEND_URL", "http://localhost:3001"),
    storeName: optional("STORE_NAME", "ClickDz Store"),
    storePhone: optional("STORE_PHONE", ""),
    storeAddress: optional("STORE_ADDRESS", ""),
    storeWilayaCode: parseInt(optional("STORE_WILAYA_CODE", "16"), 10),
  },

  db: {
    url: required("DATABASE_URL"),
  },

  redis: {
    url: optional("REDIS_URL", "redis://localhost:6379"),
  },

  jwt: {
    accessSecret: optional("JWT_SECRET", "dev-access-secret-change-me-32chars!"),
    refreshSecret: optional("JWT_REFRESH_SECRET", "dev-refresh-secret-change-me-32chars"),
    accessExpiresIn: optional("JWT_ACCESS_EXPIRES_IN", "15m"),
    refreshExpiresIn: optional("JWT_REFRESH_EXPIRES_IN", "7d"),
  },

  rateLimit: {
    windowMs: parseInt(optional("RATE_LIMIT_WINDOW_MS", "60000"), 10),
    maxRequests: parseInt(optional("RATE_LIMIT_MAX_REQUESTS", "100"), 10),
    authMax: parseInt(optional("RATE_LIMIT_AUTH_MAX", "5"), 10),
  },

  chargily: {
    apiKey: optional("CHARGILY_API_KEY", ""),
    secretKey: optional("CHARGILY_SECRET_KEY", ""),
    webhookSecret: optional("CHARGILY_WEBHOOK_SECRET", ""),
    baseUrl: optional("CHARGILY_BASE_URL", "https://pay.chargily.net/test/api/v2"),
  },

  slickpay: {
    publicKey: optional("SLICKPAY_PUBLIC_KEY", ""),
    privateKey: optional("SLICKPAY_PRIVATE_KEY", ""),
    baseUrl: optional("SLICKPAY_BASE_URL", "https://devapi.slick-pay.com/api/v2"),
  },

  stripe: {
    secretKey: optional("STRIPE_SECRET_KEY", ""),
    webhookSecret: optional("STRIPE_WEBHOOK_SECRET", ""),
  },

  shipping: {
    yalidine: {
      apiId: optional("YALIDINE_API_ID", ""),
      apiToken: optional("YALIDINE_API_TOKEN", ""),
      baseUrl: optional("YALIDINE_BASE_URL", "https://api.yalidine.app/v1"),
    },
    zrExpress: {
      apiToken: optional("ZREXPRESS_API_TOKEN", ""),
      baseUrl: optional("ZREXPRESS_BASE_URL", "https://api.zrexpress.com/api"),
    },
    ems: {
      apiKey: optional("EMS_API_KEY", ""),
      baseUrl: optional("EMS_BASE_URL", "https://api.poste.dz/ems/v1"),
    },
    maystro: {
      apiToken: optional("MAYSTRO_API_TOKEN", ""),
      baseUrl: optional("MAYSTRO_BASE_URL", "https://api.maystro-delivery.com"),
    },
  },

  smtp: {
    host: optional("SMTP_HOST", "smtp.gmail.com"),
    port: parseInt(optional("SMTP_PORT", "587"), 10),
    user: optional("SMTP_USER", ""),
    pass: optional("SMTP_PASS", ""),
    from: optional("EMAIL_FROM", "noreply@clickdz.shop"),
  },

  upload: {
    maxSizeMb: parseInt(optional("UPLOAD_MAX_SIZE_MB", "5"), 10),
    dir: optional("UPLOAD_DIR", "./uploads"),
  },

  admin: {
    email: optional("ADMIN_EMAIL", "admin@clickdz.com"),
    password: optional("ADMIN_PASSWORD", "ChangeMe123!"),
  },
};
