import crypto from "crypto";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../config/logger";

export const webhookService = {
  async create(userId: string, data: { url: string; events: string[]; secret?: string }) {
    const secret = data.secret || crypto.randomBytes(32).toString("hex");

    return prisma.webhookEndpoint.create({
      data: {
        userId,
        url: data.url,
        events: data.events,
        secret,
      },
    });
  },

  async list(userId: string) {
    return prisma.webhookEndpoint.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async update(id: string, userId: string, data: { url?: string; events?: string[]; isActive?: boolean }) {
    const endpoint = await prisma.webhookEndpoint.findFirst({ where: { id, userId } });
    if (!endpoint) throw new AppError("Webhook endpoint not found", 404);

    return prisma.webhookEndpoint.update({
      where: { id },
      data,
    });
  },

  async remove(id: string, userId: string) {
    const endpoint = await prisma.webhookEndpoint.findFirst({ where: { id, userId } });
    if (!endpoint) throw new AppError("Webhook endpoint not found", 404);

    await prisma.webhookEndpoint.delete({ where: { id } });
  },

  async dispatch(event: string, payload: any) {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: { isActive: true, events: { array_contains: event } as any },
    });

    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
        const signature = crypto.createHmac("sha256", endpoint.secret).update(body).digest("hex");

        const delivery = await prisma.webhookDelivery.create({
          data: { endpointId: endpoint.id, event, payload: body },
        });

        try {
          const response = await fetch(endpoint.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Signature": signature,
              "X-Webhook-Event": event,
            },
            body,
            signal: AbortSignal.timeout(10000),
          });

          await prisma.webhookDelivery.update({
            where: { id: delivery.id },
            data: {
              statusCode: response.status,
              response: await response.text().catch(() => ""),
              success: response.ok,
            },
          });

          return { endpointId: endpoint.id, status: response.status };
        } catch (err: any) {
          await prisma.webhookDelivery.update({
            where: { id: delivery.id },
            data: { statusCode: 0, response: err.message, success: false },
          });

          logger.warn(`Webhook delivery failed for ${endpoint.url}: ${err.message}`);
          return { endpointId: endpoint.id, error: err.message };
        }
      })
    );

    return results;
  },

  async getDeliveries(endpointId: string, userId: string, page = 1, limit = 20) {
    const endpoint = await prisma.webhookEndpoint.findFirst({ where: { id: endpointId, userId } });
    if (!endpoint) throw new AppError("Webhook endpoint not found", 404);

    const skip = (page - 1) * limit;
    const [deliveries, total] = await Promise.all([
      prisma.webhookDelivery.findMany({
        where: { endpointId: endpointId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.webhookDelivery.count({ where: { endpointId: endpointId } }),
    ]);
    return { deliveries, total, page, limit };
  },
};
