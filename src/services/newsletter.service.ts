import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import crypto from "crypto";

export const newsletterService = {
  async subscribe(email: string, source = "API", firstName?: string) {
    const normalized = email.toLowerCase().trim();

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: normalized } });
    if (existing) {
      if (existing.isActive) return existing;
      // Re-subscribe
      return prisma.newsletterSubscriber.update({
        where: { email: normalized },
        data: { isActive: true, unsubscribedAt: null, source },
      });
    }

    return prisma.newsletterSubscriber.create({
      data: {
        email: normalized,
        firstName,
        source,
        confirmedAt: new Date(), // Auto-confirm for simplicity
      },
    });
  },

  async unsubscribe(email: string) {
    const normalized = email.toLowerCase().trim();
    const sub = await prisma.newsletterSubscriber.findUnique({ where: { email: normalized } });
    if (!sub) throw new AppError("Subscriber not found", 404);

    return prisma.newsletterSubscriber.update({
      where: { email: normalized },
      data: { isActive: false, unsubscribedAt: new Date() },
    });
  },

  async list(page = 1, limit = 50, activeOnly = true) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (activeOnly) where.isActive = true;

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);
    return { subscribers, total, page, limit };
  },

  async getStats() {
    const [total, active, thisMonth] = await Promise.all([
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.newsletterSubscriber.count({
        where: {
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          isActive: true,
        },
      }),
    ]);
    return { total, active, unsubscribed: total - active, newThisMonth: thisMonth };
  },

  async exportEmails() {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true, firstName: true, createdAt: true },
    });
    return subscribers;
  },
};
