import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";

// Configurable: 1 point per 100 DZD spent
const POINTS_PER_DZD = 1 / 100;
const POINTS_VALUE_DZD = 10; // 1 point = 10 DZD discount

const TIERS = [
  { name: "BRONZE", minPoints: 0 },
  { name: "SILVER", minPoints: 500 },
  { name: "GOLD", minPoints: 2000 },
  { name: "PLATINUM", minPoints: 5000 },
];

function getTier(totalPoints: number): string {
  return [...TIERS].reverse().find((t) => totalPoints >= t.minPoints)?.name || "BRONZE";
}

export const loyaltyService = {
  async getOrCreateAccount(userId: string) {
    return prisma.loyaltyAccount.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
  },

  async earnPoints(userId: string, orderTotal: number, orderId: string) {
    const points = Math.floor(orderTotal * POINTS_PER_DZD);
    if (points <= 0) return;

    const account = await this.getOrCreateAccount(userId);
    const newTotal = account.totalPoints + points;
    const newCurrent = account.currentPoints + points;

    await prisma.$transaction([
      prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          totalPoints: newTotal,
          currentPoints: newCurrent,
          tier: getTier(newTotal),
        },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          points,
          type: "EARN",
          source: "ORDER",
          orderId,
          note: `Earned ${points} points from order`,
        },
      }),
    ]);
  },

  async redeemPoints(userId: string, points: number, orderId?: string) {
    const account = await this.getOrCreateAccount(userId);
    if (account.currentPoints < points) {
      throw new AppError(`Insufficient points. Available: ${account.currentPoints}`, 400);
    }

    const discount = points * POINTS_VALUE_DZD;

    await prisma.$transaction([
      prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: { currentPoints: account.currentPoints - points },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          points: -points,
          type: "REDEEM",
          source: "ORDER",
          orderId,
          note: `Redeemed ${points} points for ${discount} DZD discount`,
        },
      }),
    ]);

    return { pointsRedeemed: points, discountAmount: discount };
  },

  async getBalance(userId: string) {
    const account = await this.getOrCreateAccount(userId);
    return {
      currentPoints: account.currentPoints,
      totalPoints: account.totalPoints,
      tier: account.tier,
      pointValue: POINTS_VALUE_DZD,
      availableDiscount: account.currentPoints * POINTS_VALUE_DZD,
      nextTier: TIERS.find((t) => t.minPoints > account.totalPoints),
    };
  },

  async getHistory(userId: string, page = 1, limit = 20) {
    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    if (!account) return { transactions: [], total: 0, page, limit };

    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.loyaltyTransaction.findMany({
        where: { accountId: account.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.loyaltyTransaction.count({ where: { accountId: account.id } }),
    ]);
    return { transactions, total, page, limit };
  },
};
