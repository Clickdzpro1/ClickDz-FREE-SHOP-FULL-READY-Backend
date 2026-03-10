import { Request, Response } from "express";
import { searchService } from "../services/search.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Locale } from "../types";

export const search = asyncHandler(async (req: Request, res: Response) => {
  const { q, category, minPrice, maxPrice, page, limit } = req.query;
  const result = await searchService.fullTextSearch(q as string, {
    locale: req.locale as Locale,
    categoryId: category as string,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 20,
  });
  res.json(success(result));
});

export const suggest = asyncHandler(async (req: Request, res: Response) => {
  const result = await searchService.suggest(
    req.query.q as string,
    req.locale as Locale,
    parseInt(req.query.limit as string) || 5
  );
  res.json(success(result));
});

export const searchCategories = asyncHandler(async (req: Request, res: Response) => {
  const result = await searchService.searchCategories(req.query.q as string);
  res.json(success(result));
});
