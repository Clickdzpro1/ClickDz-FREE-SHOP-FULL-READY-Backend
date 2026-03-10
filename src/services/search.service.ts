import { prisma } from "../config/database";
import { Locale } from "../types";

export const searchService = {
  async fullTextSearch(query: string, options: {
    locale?: Locale;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  } = {}) {
    const { locale = "en", categoryId, minPrice, maxPrice, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    // Build search condition across all language fields
    if (query) {
      where.OR = [
        { nameEn: { contains: query, mode: "insensitive" } },
        { nameFr: { contains: query, mode: "insensitive" } },
        { nameAr: { contains: query, mode: "insensitive" } },
        { descriptionEn: { contains: query, mode: "insensitive" } },
        { descriptionFr: { contains: query, mode: "insensitive" } },
        { descriptionAr: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
        { tags: { has: query.toLowerCase() } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined) {
      where.price = { ...where.price, gte: minPrice };
    }
    if (maxPrice !== undefined) {
      where.price = { ...where.price, lte: maxPrice };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: { select: { id: true, slug: true, nameEn: true, nameFr: true, nameAr: true } },
        },
        orderBy: [
          { isFeatured: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
  },

  async suggest(query: string, _locale: Locale = "en", maxResults = 5) {
    if (!query || query.length < 2) return [];

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { nameEn: { contains: query, mode: "insensitive" } },
          { nameFr: { contains: query, mode: "insensitive" } },
          { nameAr: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameFr: true,
        nameAr: true,
        images: { take: 1, select: { url: true } },
        price: true,
      },
      take: maxResults,
    });

    return products;
  },

  async searchCategories(query: string) {
    return prisma.category.findMany({
      where: {
        OR: [
          { nameEn: { contains: query, mode: "insensitive" } },
          { nameFr: { contains: query, mode: "insensitive" } },
          { nameAr: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    });
  },
};
