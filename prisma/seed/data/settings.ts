export const defaultSettings: Record<string, any> = {
  "store.name": { ar: "متجري", fr: "Ma Boutique", en: "My Shop" },
  "store.description": {
    ar: "متجر إلكتروني جزائري",
    fr: "Boutique en ligne algérienne",
    en: "Algerian online store",
  },
  "store.currency": "DZD",
  "store.defaultLocale": "fr",
  "store.supportedLocales": ["ar", "fr", "en"],
  "store.phone": "+213xxxxxxxxx",
  "store.email": "contact@myshop.dz",
  "store.address": {
    ar: "الجزائر العاصمة",
    fr: "Alger, Algérie",
    en: "Algiers, Algeria",
  },
  "store.social": {
    facebook: "",
    instagram: "",
    tiktok: "",
  },
  "shipping.defaultProvider": "MANUAL",
  "shipping.freeShippingThreshold": 10000, // DZD
  "payment.enabledMethods": ["COD", "CCP_BARIDIMOB", "CHARGILY_EDAHABIA", "CHARGILY_CIB"],
  "payment.ccp.accountNumber": "00799999999999",
  "payment.ccp.accountName": "Nom du Compte",
  "payment.ccp.rib": "00799999999999990006051",
  "order.autoConfirmOnlinePayment": true,
  "order.lowStockThreshold": 5,
};
