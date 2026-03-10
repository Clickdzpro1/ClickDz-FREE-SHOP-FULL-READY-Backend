import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { notificationService } from "./notification.service";
import { logger } from "../config/logger";

export const stockAlertService = {
  async subscribe(userId: string, productId: string, variantId?: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError("Product not found", 404);

    // Check if already in stock
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (variant && variant.stock > 0) throw new AppError("This item is already in stock", 400);
    } else if (product.stock > 0) {
      throw new AppError("This product is already in stock", 400);
    }

    return prisma.stockAlert.upsert({
      where: { userId_productId_variantId: { userId, productId, variantId: variantId || null as any } },
      create: { userId, productId, variantId },
      update: { notified: false, notifiedAt: null },
    });
  },

  async unsubscribe(userId: string, productId: string, variantId?: string) {
    await prisma.stockAlert.deleteMany({
      where: { userId, productId, variantId: variantId || null },
    });
  },

  async getUserAlerts(userId: string) {
    return prisma.stockAlert.findMany({
      where: { userId, notified: false },
      include: {
        product: { include: { images: { take: 1 } } },
        variant: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Called when product stock is updated.
   * Notifies all subscribers that the product is back in stock.
   */
  async checkAndNotify(productId: string, variantId?: string) {
    const where: any = { productId, notified: false };
    if (variantId) where.variantId = variantId;

    const alerts = await prisma.stockAlert.findMany({
      where,
      include: { product: true, user: true },
    });

    if (alerts.length === 0) return;

    logger.info(`Sending back-in-stock alerts to ${alerts.length} subscribers for product ${productId}`);

    for (const alert of alerts) {
      try {
        const name = alert.product.nameFr || alert.product.nameEn;
        await notificationService.sendBackInStockAlert(alert.userId, name, alert.product.slug);
        await prisma.stockAlert.update({
          where: { id: alert.id },
          data: { notified: true, notifiedAt: new Date() },
        });
      } catch (err) {
        logger.error(`Failed to send stock alert ${alert.id}:`, err);
      }
    }
  },
};
