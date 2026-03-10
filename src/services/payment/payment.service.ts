import { prisma } from "../../config/database";
import { logger } from "../../config/logger";
import { AppError } from "../../middleware/errorHandler";
import { getPaymentGateway, PaymentMethodKey } from "./payment.factory";
import { WebhookResult } from "./payment.interface";

export class PaymentService {
  /**
   * Initiate payment for an order.
   */
  async initiatePayment(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { payment: true, user: true },
    });

    if (!order) throw new AppError("Order not found", 404);
    if (order.payment?.status === "PAID") {
      throw new AppError("Order is already paid", 400);
    }

    const methodKey = order.paymentMethod as PaymentMethodKey;
    const gateway = getPaymentGateway(methodKey);

    // Extract info from shippingAddress JSON snapshot or user record
    const addr = order.shippingAddress as any;
    const customerPhone = addr?.phone || order.user?.phone || undefined;
    const customerName = addr?.name || `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() || "Customer";

    const result = await gateway.initiate({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: Number(order.total),
      description: `Order ${order.orderNumber}`,
      customerEmail: order.user?.email || "",
      customerName,
      customerPhone,
      successUrl: undefined,
      failureUrl: undefined,
      webhookUrl: undefined,
    });

    // Upsert payment record (initiate always returns "pending" or "requires_action")
    const gatewayRaw = result.raw ? JSON.parse(JSON.stringify(result.raw)) : undefined;
    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        method: order.paymentMethod,
        amount: order.total,
        gatewayId: result.gatewayId || null,
        status: "PENDING",
        gatewayResponse: gatewayRaw,
      },
      update: {
        gatewayId: result.gatewayId || null,
        status: "PENDING",
        gatewayResponse: gatewayRaw,
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
      amount: Number(order.total),
      gatewayId: result.gatewayId,
      checkoutUrl: result.checkoutUrl,
      status: result.status,
      raw: result.raw,
    };
  }

  /**
   * Handle webhook from a payment gateway.
   */
  async handleWebhook(
    method: PaymentMethodKey,
    body: Buffer | string,
    headers: Record<string, string>
  ): Promise<WebhookResult> {
    const gateway = getPaymentGateway(method);
    const result = await gateway.handleWebhook(body, headers);

    logger.info(`Payment webhook [${method}]: order=${result.orderId} status=${result.status}`);

    // Update payment record
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { gatewayId: result.gatewayId },
          { order: { id: result.orderId } },
        ],
      },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: result.status === "paid" ? "PAID" : "FAILED",
          gatewayId: result.gatewayId,
          paidAt: result.status === "paid" ? new Date() : null,
          gatewayResponse: result.raw ? JSON.parse(JSON.stringify(result.raw)) : undefined,
        },
      });

      // Update order status if payment succeeded
      if (result.status === "paid") {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: "CONFIRMED",
            confirmedAt: new Date(),
          },
        });
      }
    }

    return result;
  }

  /**
   * Check payment status from gateway.
   * userId is optional — if provided, verifies the order belongs to that user.
   */
  async checkStatus(orderId: string, userId?: string) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });

    if (!payment) throw new AppError("Payment not found", 404);

    // Verify ownership if userId is provided (customer endpoint)
    if (userId && payment.order.userId !== userId) {
      throw new AppError("Payment not found", 404);
    }

    // For manual methods, return DB status
    if (["CCP_BARIDIMOB", "COD"].includes(payment.method)) {
      return {
        orderId: payment.orderId,
        method: payment.method,
        status: payment.status,
        amount: Number(payment.amount),
        paidAt: payment.paidAt,
      };
    }

    // For gateway methods, check with provider
    if (payment.gatewayId) {
      const methodKey = payment.method as PaymentMethodKey;
      const gateway = getPaymentGateway(methodKey);
      const result = await gateway.getStatus(payment.gatewayId);

      // Sync status
      const newStatus = result.status === "paid" ? "PAID" as const :
                        result.status === "failed" ? "FAILED" as const : "PENDING" as const;

      if (payment.status !== newStatus) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: newStatus,
            paidAt: newStatus === "PAID" ? new Date() : payment.paidAt,
          },
        });
      }

      return {
        orderId: payment.orderId,
        method: payment.method,
        status: newStatus,
        amount: result.amount,
        paidAt: payment.paidAt,
      };
    }

    return {
      orderId: payment.orderId,
      method: payment.method,
      status: payment.status,
      amount: Number(payment.amount),
      paidAt: payment.paidAt,
    };
  }

  /**
   * Admin: Confirm manual payment (CCP/BaridiMob).
   */
  async confirmManualPayment(orderId: string) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) throw new AppError("Payment not found", 404);
    if (payment.method !== "CCP_BARIDIMOB") {
      throw new AppError("Only CCP/BaridiMob payments can be manually confirmed", 400);
    }
    if (payment.status === "PAID") {
      throw new AppError("Payment is already confirmed", 400);
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", paidAt: new Date() },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
      }),
    ]);

    return { orderId, status: "PAID" };
  }

  /**
   * Admin: Reject manual payment (CCP/BaridiMob).
   */
  async rejectManualPayment(orderId: string) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) throw new AppError("Payment not found", 404);
    if (payment.status === "PAID") {
      throw new AppError("Cannot reject a completed payment", 400);
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      }),
    ]);

    return { orderId, status: "FAILED" };
  }

  /**
   * Initiate a refund.
   */
  async refund(orderId: string, amount?: number) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) throw new AppError("Payment not found", 404);
    if (payment.status !== "PAID") {
      throw new AppError("Can only refund completed payments", 400);
    }

    const methodKey = payment.method as PaymentMethodKey;
    const gateway = getPaymentGateway(methodKey);

    const result = await gateway.refund(payment.gatewayId || "", amount);

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: result.status === "refunded" ? "REFUNDED" : "PAID",
      },
    });

    return {
      orderId,
      refundId: result.refundId,
      status: result.status,
      amount: result.amount,
    };
  }
}

export const paymentService = new PaymentService();
