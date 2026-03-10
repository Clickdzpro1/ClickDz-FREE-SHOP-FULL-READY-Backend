import { Locale } from "../types";

/**
 * Pick the localized field from a trilingual record.
 * Usage: localize(product, 'name', 'fr') → product.nameFr
 */
export function localize<T extends Record<string, unknown>>(
  record: T,
  field: string,
  locale: Locale = "fr"
): string {
  const suffix = locale === "ar" ? "Ar" : locale === "en" ? "En" : "Fr";
  const key = `${field}${suffix}`;
  return (record[key] as string) || (record[`${field}Fr`] as string) || "";
}

/**
 * Build a localized projection for Prisma select.
 * Returns all three language fields for a given base name.
 */
export function localizedFields(field: string): Record<string, boolean> {
  return {
    [`${field}Ar`]: true,
    [`${field}Fr`]: true,
    [`${field}En`]: true,
  };
}

/**
 * Error/success messages in three languages.
 */
export const messages = {
  notFound: {
    ar: "غير موجود",
    fr: "Non trouvé",
    en: "Not found",
  },
  unauthorized: {
    ar: "غير مصرح",
    fr: "Non autorisé",
    en: "Unauthorized",
  },
  forbidden: {
    ar: "محظور",
    fr: "Interdit",
    en: "Forbidden",
  },
  validationError: {
    ar: "خطأ في البيانات",
    fr: "Erreur de validation",
    en: "Validation error",
  },
  serverError: {
    ar: "خطأ في الخادم",
    fr: "Erreur serveur",
    en: "Server error",
  },
  success: {
    ar: "تم بنجاح",
    fr: "Succès",
    en: "Success",
  },
} as const;

export function getMessage(
  key: keyof typeof messages,
  locale: Locale = "fr"
): string {
  return messages[key][locale];
}
