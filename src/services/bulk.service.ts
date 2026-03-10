import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";

export const bulkService = {
  async updateProductPrices(updates: { productId: string; price: number }[]) {
    const results = await prisma.$transaction(
      updates.map((u) =>
        prisma.product.update({
          where: { id: u.productId },
          data: { price: u.price },
          select: { id: true, nameEn: true, price: true },
        })
      )
    );
    return results;
  },

  async updateProductStock(updates: { productId: string; stock: number }[]) {
    const results = await prisma.$transaction(
      updates.map((u) =>
        prisma.product.update({
          where: { id: u.productId },
          data: { stock: u.stock },
          select: { id: true, nameEn: true, stock: true },
        })
      )
    );
    return results;
  },

  async deactivateProducts(productIds: string[]) {
    const result = await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { isActive: false },
    });
    return { deactivated: result.count };
  },

  async activateProducts(productIds: string[]) {
    const result = await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { isActive: true },
    });
    return { activated: result.count };
  },

  async bulkUpdateOrderStatus(orderIds: string[], status: string) {
    // Validate all orders exist
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      select: { id: true },
    });

    if (orders.length !== orderIds.length) {
      throw new AppError("Some orders not found", 404);
    }

    const results = await prisma.$transaction(
      orderIds.map((id) =>
        prisma.order.update({
          where: { id },
          data: { status: status as any },
          select: { id: true, orderNumber: true, status: true },
        })
      )
    );
    return results;
  },

  async deleteReviews(reviewIds: string[]) {
    const result = await prisma.review.deleteMany({
      where: { id: { in: reviewIds } },
    });
    return { deleted: result.count };
  },

  async importProducts(products: {
    nameEn: string;
    nameFr: string;
    nameAr: string;
    slug: string;
    price: number;
    stock: number;
    categoryId: string;
    sku?: string;
    descriptionEn?: string;
    descriptionFr?: string;
    descriptionAr?: string;
  }[]) {
    const results = await prisma.$transaction(
      products.map((p) =>
        prisma.product.create({
          data: p,
          select: { id: true, nameEn: true, slug: true },
        })
      )
    );
    return results;
  },
};
