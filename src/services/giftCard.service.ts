import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import crypto from "crypto";

function generateCode(): string {
  return "GC-" + crypto.randomBytes(6).toString("hex").toUpperCase();
}

export const giftCardService = {
  async create(data: {
    initialBalance: number;
    purchasedById?: string;
    recipientEmail?: string;
    recipientName?: string;
    message?: string;
    expiresAt?: Date;
  }) {
    return prisma.giftCard.create({
      data: {
        code: generateCode(),
        initialBalance: data.initialBalance,
        currentBalance: data.initialBalance,
        purchasedById: data.purchasedById,
        recipientEmail: data.recipientEmail,
        recipientName: data.recipientName,
        message: data.message,
        expiresAt: data.expiresAt,
      },
    });
  },

  async getByCode(code: string) {
    const card = await prisma.giftCard.findUnique({ where: { code } });
    if (!card) throw new AppError("Gift card not found", 404);
    if (card.status !== "ACTIVE") throw new AppError(`Gift card is ${card.status.toLowerCase()}`, 400);
    if (card.expiresAt && card.expiresAt < new Date()) {
      await prisma.giftCard.update({ where: { id: card.id }, data: { status: "EXPIRED" } });
      throw new AppError("Gift card has expired", 400);
    }
    return card;
  },

  async redeem(code: string, amount: number, userId: string, orderId?: string) {
    const card = await this.getByCode(code);
    const balance = Number(card.currentBalance);
    if (balance < amount) throw new AppError(`Insufficient balance. Available: ${balance} DZD`, 400);

    const newBalance = balance - amount;

    await prisma.$transaction([
      prisma.giftCard.update({
        where: { id: card.id },
        data: {
          currentBalance: newBalance,
          redeemedById: card.redeemedById || userId,
          status: newBalance === 0 ? "USED" : "ACTIVE",
        },
      }),
      prisma.giftCardTransaction.create({
        data: {
          giftCardId: card.id,
          amount: -amount,
          type: "REDEMPTION",
          orderId,
          note: `Redeemed ${amount} DZD`,
        },
      }),
    ]);

    return { amountDeducted: amount, remainingBalance: newBalance };
  },

  async checkBalance(code: string) {
    const card = await this.getByCode(code);
    return { code: card.code, balance: card.currentBalance, currency: card.currency, expiresAt: card.expiresAt };
  },

  async list(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [cards, total] = await Promise.all([
      prisma.giftCard.findMany({ orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.giftCard.count(),
    ]);
    return { cards, total, page, limit };
  },

  async disable(id: string) {
    return prisma.giftCard.update({ where: { id }, data: { status: "DISABLED" } });
  },
};
