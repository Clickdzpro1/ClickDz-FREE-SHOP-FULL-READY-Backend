import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { parsePagination, buildPaginatedResult, buildPrismaSkip } from "../utils/pagination";
import { CreateReviewInput, UpdateReviewInput } from "../schemas/review.schema";

export class ReviewService {
  async listByProduct(productId: string, query: Record<string, string | undefined>) {
    const params = parsePagination(query);

    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId, isApproved: true },
        skip: buildPrismaSkip(params),
        take: params.limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.review.count({ where: { productId, isApproved: true } }),
    ]);

    // Calculate average rating
    const stats = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      ...buildPaginatedResult(data, total, params),
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating,
      },
    };
  }

  async create(userId: string, data: CreateReviewInput) {
    // Check for duplicate
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId: data.productId } },
    });
    if (existing) throw new AppError("You have already reviewed this product", 409);

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new AppError("Product not found", 404);

    return prisma.review.create({
      data: { ...data, userId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  }

  async update(userId: string, reviewId: string, data: UpdateReviewInput) {
    const review = await prisma.review.findFirst({ where: { id: reviewId, userId } });
    if (!review) throw new AppError("Review not found", 404);

    return prisma.review.update({
      where: { id: reviewId },
      data: { ...data, isApproved: false }, // Re-approve needed after edit
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  }

  async delete(userId: string, reviewId: string) {
    const review = await prisma.review.findFirst({ where: { id: reviewId, userId } });
    if (!review) throw new AppError("Review not found", 404);
    await prisma.review.delete({ where: { id: reviewId } });
  }

  // Admin methods
  async listPending(query: Record<string, string | undefined>) {
    const params = parsePagination(query);

    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where: { isApproved: false },
        skip: buildPrismaSkip(params),
        take: params.limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          product: { select: { id: true, slug: true, nameFr: true } },
        },
      }),
      prisma.review.count({ where: { isApproved: false } }),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async approve(reviewId: string) {
    return prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true },
    });
  }

  async adminDelete(reviewId: string) {
    await prisma.review.delete({ where: { id: reviewId } });
  }
}

export const reviewService = new ReviewService();
