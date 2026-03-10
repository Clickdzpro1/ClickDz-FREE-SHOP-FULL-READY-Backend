import { Request, Response, NextFunction } from "express";
import { Locale } from "../types";

const SUPPORTED_LOCALES: Locale[] = ["ar", "fr", "en"];
const DEFAULT_LOCALE: Locale = "fr";

export function locale(req: Request, _res: Response, next: NextFunction) {
  const headerLocale = req.headers["accept-language"]?.split(",")[0]?.split("-")[0];
  const queryLocale = req.query.lang as string;

  const requested = queryLocale || headerLocale || DEFAULT_LOCALE;

  req.locale = SUPPORTED_LOCALES.includes(requested as Locale)
    ? (requested as Locale)
    : DEFAULT_LOCALE;

  next();
}
