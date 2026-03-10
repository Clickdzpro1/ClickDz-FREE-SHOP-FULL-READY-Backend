import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { ReturnStatus } from "@prisma/client";

export const returnService = {
  async create(userId: string, data: {
    orderId: string;
    reason: any;
    description?: string;
    images?: string[];
  }) {
    const order = await prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order || order.userId !== userId) throw new AppError("Order not found", 404);
    if (order.status !== "DELIVERED") throw new AppError("Can only request returns for delivered orders", 400);

    // Check if return already exists
    const existing = await prisma.returnRequest.findFirst({
      where: { orderId: data.orderId, status: { notIn: ["CLOSED", "REJECTED"] } },
    });
    if (existing) throw new AppError("A return request already exists for this order", 400);

    return prisma.returnRequest.create({
      data: {
        orderId: data.orderId,
        userId,
        reason: data.reason,
        description: data.description,
        images: data.images ? JSON.stringify(data.images) : undefined,
      },
      include: { order: { select: { orderNumber: true } } },
    });
  },

  async getByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [returns, total] = await Promise.all([
      prisma.returnRequest.findMany({
        where: { userId },
        include: { order: { select: { orderNumber: true, total: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.returnRequest.count({ where: { userId } }),
    ]);
    return { returns, total, page, limit };
  },

  async getById(id: string, userId?: string) {
    const returnReq = await prisma.returnRequest.findUnique({
      where: { id },
      include: {
        order: { include: { items: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (!returnReq) throw new AppError("Return request not found", 404);
    if (userId && returnReq.userId !== userId) throw new AppError("Return request not found", 404);
    return returnReq;
  },

  // ─── Admin ──────────────────────────────────────────
  async listAll(filters: { status?: ReturnStatus; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [returns, total] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        include: {
          order: { select: { orderNumber: true } },
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.returnRequest.count({ where }),
    ]);
    return { returns, total, page, limit };
  },

  async updateStatus(id: string, data: {
    status: ReturnStatus;
    adminNote?: string;
    refundAmount?: number;
    trackingNumber?: string;
  }) {
    const returnReq = await prisma.returnRequest.findUnique({ where: { id } });
    if (!returnReq) throw new AppError("Return request not found", 404);

    return prisma.returnRequest.update({
      where: { id },
      data: {
        status: data.status,
        adminNote: data.adminNote,
        refundAmount: data.refundAmount,
        trackingNumber: data.trackingNumber,
        resolvedAt: ["REFUNDED", "CLOSED", "REJECTED"].includes(data.status) ? new Date() : undefined,
      },
    });
  },
};
