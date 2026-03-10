import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { SubscriptionInterval } from "@prisma/client";

function getNextOrderDate(interval: SubscriptionInterval, from: Date = new Date()): Date {
  const next = new Date(from);
  switch (interval) {
    case "WEEKLY": next.setDate(next.getDate() + 7); break;
    case "BIWEEKLY": next.setDate(next.getDate() + 14); break;
    case "MONTHLY": next.setMonth(next.getMonth() + 1); break;
    case "QUARTERLY": next.setMonth(next.getMonth() + 3); break;
    case "YEARLY": next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
}

export const subscriptionService = {
  async create(userId: string, data: {
    productId: string;
    variantId?: string;
    quantity: number;
    interval: SubscriptionInterval;
    addressId: string;
  }) {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new AppError("Product not found", 404);

    const address = await prisma.address.findFirst({ where: { id: data.addressId, userId } });
    if (!address) throw new AppError("Address not found", 404);

    const price = data.variantId
      ? Number((await prisma.productVariant.findUnique({ where: { id: data.variantId } }))?.price || product.price)
      : Number(product.price);

    return prisma.subscription.create({
      data: {
        userId,
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
        interval: data.interval,
        price: price * data.quantity,
        addressId: data.addressId,
        nextOrderAt: getNextOrderDate(data.interval),
      },
      include: {
        product: { include: { images: { take: 1 } } },
      },
    });
  },

  async getByUser(userId: string) {
    return prisma.subscription.findMany({
      where: { userId },
      include: {
        product: { include: { images: { take: 1 } } },
        variant: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async pause(id: string, userId: string) {
    const sub = await prisma.subscription.findFirst({ where: { id, userId } });
    if (!sub) throw new AppError("Subscription not found", 404);
    if (sub.status !== "ACTIVE") throw new AppError("Subscription is not active", 400);

    return prisma.subscription.update({ where: { id }, data: { status: "PAUSED" } });
  },

  async resume(id: string, userId: string) {
    const sub = await prisma.subscription.findFirst({ where: { id, userId } });
    if (!sub) throw new AppError("Subscription not found", 404);
    if (sub.status !== "PAUSED") throw new AppError("Subscription is not paused", 400);

    return prisma.subscription.update({
      where: { id },
      data: { status: "ACTIVE", nextOrderAt: getNextOrderDate(sub.interval) },
    });
  },

  async cancel(id: string, userId: string) {
    const sub = await prisma.subscription.findFirst({ where: { id, userId } });
    if (!sub) throw new AppError("Subscription not found", 404);

    return prisma.subscription.update({
      where: { id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
  },

  async updateInterval(id: string, userId: string, interval: SubscriptionInterval) {
    const sub = await prisma.subscription.findFirst({ where: { id, userId } });
    if (!sub) throw new AppError("Subscription not found", 404);

    return prisma.subscription.update({
      where: { id },
      data: { interval, nextOrderAt: getNextOrderDate(interval) },
    });
  },

  /**
   * Process due subscriptions (called by cron or admin).
   * Creates orders for all active subscriptions due now.
   */
  async processDueSubscriptions() {
    const due = await prisma.subscription.findMany({
      where: { status: "ACTIVE", nextOrderAt: { lte: new Date() } },
      include: { product: true, variant: true },
    });

    const results = [];
    for (const sub of due) {
      try {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            lastOrderAt: new Date(),
            nextOrderAt: getNextOrderDate(sub.interval),
          },
        });
        results.push({ subscriptionId: sub.id, status: "processed" });
      } catch (err) {
        results.push({ subscriptionId: sub.id, status: "failed", error: String(err) });
      }
    }
    return results;
  },
};
