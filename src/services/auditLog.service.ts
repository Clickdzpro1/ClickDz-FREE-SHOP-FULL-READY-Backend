import { prisma } from "../config/database";

export const auditLogService = {
  async log(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({ data });
  },

  async getByEntity(entity: string, entityId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { entity, entityId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where: { entity, entityId } }),
    ]);
    return { logs, total, page, limit };
  },

  async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where: { userId } }),
    ]);
    return { logs, total, page, limit };
  },

  async listAll(filters: {
    entity?: string;
    action?: string;
    userId?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  } = {}) {
    const { entity, action, userId, from, to, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { logs, total, page, limit };
  },
};
