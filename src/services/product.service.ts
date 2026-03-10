import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { slugify } from "../utils/slug";
import { parsePagination, buildPaginatedResult, buildPrismaSkip, buildPrismaOrderBy } from "../utils/pagination";
import { CreateProductInput, UpdateProductInput } from "../schemas/product.schema";
import { Prisma } from "@prisma/client";

export class ProductService {
  async list(query: Record<string, string | undefined>) {
    const params = parsePagination(query);
    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      where.OR = [
        { nameFr: { contains: query.search, mode: "insensitive" } },
        { nameEn: { contains: query.search, mode: "insensitive" } },
        { nameAr: { contains: query.search } },
        { sku: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
    }
    if (query.isFeatured === "true") where.isFeatured = true;
    if (query.isActive !== undefined) where.isActive = query.isActive !== "false";
    else where.isActive = true; // Default: only active products

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: buildPrismaSkip(params),
        take: params.limit,
        orderBy: params.sortBy === "name"
          ? { nameFr: params.sortOrder }
          : buildPrismaOrderBy(params),
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          category: { select: { id: true, slug: true, nameFr: true, nameEn: true, nameAr: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { isActive: true }, orderBy: { name: "asc" } },
        category: { select: { id: true, slug: true, nameFr: true, nameEn: true, nameAr: true } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: { where: { isApproved: true } } } },
      },
    });
    if (!product) throw new AppError("Product not found", 404);
    return product;
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { name: "asc" } },
        category: true,
      },
    });
    if (!product) throw new AppError("Product not found", 404);
    return product;
  }

  async create(data: CreateProductInput) {
    const slug = data.slug || slugify(data.nameFr);
    const { variants, ...productData } = data;

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        price: new Prisma.Decimal(data.price),
        compareAtPrice: data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : null,
        costPrice: data.costPrice ? new Prisma.Decimal(data.costPrice) : null,
        weight: data.weight ? new Prisma.Decimal(data.weight) : null,
        variants: variants
          ? {
              create: variants.map((v) => ({
                name: v.name,
                sku: v.sku,
                price: new Prisma.Decimal(v.price),
                stock: v.stock,
                attributes: v.attributes,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });

    return product;
  }

  async update(id: string, data: UpdateProductInput) {
    await this.getById(id); // Check exists
    const { variants, ...productData } = data;

    const updateData: Prisma.ProductUpdateInput = { ...productData };
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
    if (data.compareAtPrice !== undefined)
      updateData.compareAtPrice = data.compareAtPrice
        ? new Prisma.Decimal(data.compareAtPrice)
        : null;
    if (data.costPrice !== undefined)
      updateData.costPrice = data.costPrice ? new Prisma.Decimal(data.costPrice) : null;
    if (data.weight !== undefined)
      updateData.weight = data.weight ? new Prisma.Decimal(data.weight) : null;

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: true,
      },
    });
  }

  async delete(id: string) {
    await this.getById(id);
    await prisma.product.delete({ where: { id } });
  }

  async addImage(productId: string, url: string, altText?: string) {
    const count = await prisma.productImage.count({ where: { productId } });
    return prisma.productImage.create({
      data: { productId, url, altText, sortOrder: count },
    });
  }

  async deleteImage(imageId: string) {
    await prisma.productImage.delete({ where: { id: imageId } });
  }

  async getFeatured(limit = 10) {
    return prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: { select: { id: true, slug: true, nameFr: true } },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }
}

export const productService = new ProductService();
