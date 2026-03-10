import { prisma } from "../../config/database";
import { config } from "../../config";
import { AppError } from "../../middleware/errorHandler";
import { getShippingProvider, listShippingProviders, ShippingProviderKey } from "./shipping.factory";

export class ShippingService {
  /**
   * Get shipping rates for a destination wilaya from all active providers.
   */
  async getRates(toWilayaCode: number) {
    const fromWilaya = config.app.storeWilayaCode || 16; // Default: Algiers
    const providers = listShippingProviders();
    const allRates: any[] = [];

    for (const p of providers) {
      try {
        const provider = getShippingProvider(p.key);
        const rates = await provider.getRates({
          fromWilayaCode: fromWilaya,
          toWilayaCode: toWilayaCode,
        });
        allRates.push(...rates);
      } catch {
        // Skip providers that fail — continue with others
      }
    }

    return allRates;
  }

  /**
   * Create a shipment for an order.
   */
  async createShipment(orderId: string, providerKey: ShippingProviderKey) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) throw new AppError("Order not found", 404);
    if (!["CONFIRMED", "PROCESSING"].includes(order.status)) {
      throw new AppError("Order must be confirmed or processing to create shipment", 400);
    }

    const provider = getShippingProvider(providerKey);

    // Extract shipping info from the JSON snapshot
    const addr = order.shippingAddress as any;

    const result = await provider.createShipment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      senderName: config.app.storeName || "ClickDz Store",
      senderPhone: config.app.storePhone || "",
      senderAddress: config.app.storeAddress || "",
      senderWilayaCode: config.app.storeWilayaCode || 16,
      recipientName: addr?.name || `${order.user.firstName} ${order.user.lastName}`,
      recipientPhone: addr?.phone || order.user.phone || "",
      recipientAddress: addr?.address || "",
      recipientWilayaCode: addr?.wilayaCode || 16,
      recipientCommuneName: addr?.commune || addr?.city || "",
      weight: 1,
      value: Number(order.total),
      isCod: order.paymentMethod === "COD",
      codAmount: order.paymentMethod === "COD" ? Number(order.total) : 0,
      notes: order.customerNote || undefined,
    });

    // Update order with tracking info
    await prisma.order.update({
      where: { id: orderId },
      data: {
        shippingProvider: providerKey as any,
        trackingNumber: result.trackingNumber,
        status: "SHIPPED",
        shippedAt: new Date(),
      },
    });

    // Add status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: "SHIPPED",
        note: `Shipment created with ${providerKey}. Tracking: ${result.trackingNumber}`,
      },
    });

    return result;
  }

  /**
   * Track a shipment.
   */
  async track(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new AppError("Order not found", 404);
    if (!order.trackingNumber || !order.shippingProvider) {
      throw new AppError("No shipment found for this order", 404);
    }

    const provider = getShippingProvider(order.shippingProvider as ShippingProviderKey);
    return provider.track(order.trackingNumber);
  }

  /**
   * Cancel a shipment.
   */
  async cancelShipment(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new AppError("Order not found", 404);
    if (!order.trackingNumber || !order.shippingProvider) {
      throw new AppError("No shipment found for this order", 404);
    }

    const provider = getShippingProvider(order.shippingProvider as ShippingProviderKey);
    const result = await provider.cancel(order.trackingNumber);

    if (result.success) {
      await prisma.order.update({
        where: { id: orderId },
        data: { trackingNumber: null },
      });
    }

    return result;
  }

  /**
   * Get shipping label.
   */
  async getLabel(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new AppError("Order not found", 404);
    if (!order.trackingNumber || !order.shippingProvider) {
      throw new AppError("No shipment found for this order", 404);
    }

    const provider = getShippingProvider(order.shippingProvider as ShippingProviderKey);
    return provider.getLabel(order.trackingNumber);
  }

  /**
   * List available shipping providers.
   */
  listProviders() {
    return listShippingProviders();
  }
}

export const shippingService = new ShippingService();
