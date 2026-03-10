import { prisma } from "../config/database";

export const recommendationService = {
  /**
   * "Customers also bought" — find products co-purchased with the given product.
   */
  async getAlsoBought(productId: string, limit = 6) {
    // Find orders that contain this product
    const orderIds = await prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
      take: 100,
    });

    if (orderIds.length === 0) return [];

    // Find other products in those orders
    const coProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        orderId: { in: orderIds.map((o) => o.orderId) },
        productId: { not: productId },
      },
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: limit,
    });

    const products = await prisma.product.findMany({
      where: {
        id: { in: coProducts.map((p) => p.productId) },
        isActive: true,
      },
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    });

    return products;
  },

  /**
   * "Similar products" — same category, similar price range.
   */
  async getSimilar(productId: string, limit = 6) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, price: true },
    });

    if (!product) return [];

    const priceNum = Number(product.price);
    const minPrice = priceNum * 0.5;
    const maxPrice = priceNum * 2;

    return prisma.product.findMany({
      where: {
        id: { not: productId },
        isActive: true,
        categoryId: product.categoryId,
        price: { gte: minPrice, lte: maxPrice },
      },
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  /**
   * "Recommended for you" — based on user's order history.
   */
  async getPersonalized(userId: string, limit = 12) {
    // Get categories the user has ordered from
    const userOrders = await prisma.orderItem.findMany({
      where: { order: { userId } },
      select: { product: { select: { categoryId: true } } },
      take: 50,
    });

    const categoryIds = [...new Set(userOrders.map((o) => o.product.categoryId).filter(Boolean))];

    if (categoryIds.length === 0) {
      // No order history — return featured products
      return prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
        take: limit,
      });
    }

    // Get purchased product IDs to exclude
    const purchasedIds = await prisma.orderItem.findMany({
      where: { order: { userId } },
      select: { productId: true },
      distinct: ["productId"],
    });

    return prisma.product.findMany({
      where: {
        isActive: true,
        categoryId: { in: categoryIds as string[] },
        id: { notIn: purchasedIds.map((p) => p.productId) },
      },
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
  },
};
