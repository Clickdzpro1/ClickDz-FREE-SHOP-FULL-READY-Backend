import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";

export const wishlistService = {
  async getOrCreate(userId: string) {
    return prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: {
            product: {
              include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
            },
          },
          orderBy: { addedAt: "desc" },
        },
      },
    });
  },

  async addItem(userId: string, productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError("Product not found", 404);

    const wishlist = await prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
      create: { wishlistId: wishlist.id, productId },
      update: {},
      include: { product: { include: { images: { take: 1 } } } },
    });
  },

  async removeItem(userId: string, productId: string) {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) throw new AppError("Wishlist not found", 404);

    await prisma.wishlistItem.delete({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    }).catch(() => {
      throw new AppError("Item not in wishlist", 404);
    });
  },

  async clear(userId: string) {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) return;
    await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id } });
  },

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) return false;
    const item = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });
    return !!item;
  },
};
