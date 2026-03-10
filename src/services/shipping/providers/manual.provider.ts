import { prisma } from "../../../config/database";
import {
  IShippingProvider,
  ShippingRateParams,
  ShippingRate,
  CreateShipmentParams,
  ShipmentResult,
  TrackingResult,
  CancelResult,
} from "../shipping.interface";

/**
 * Manual shipping provider — store-managed delivery.
 * Rates come from the ShippingRate table in the database.
 * Tracking is managed manually by the admin.
 */
export class ManualProvider implements IShippingProvider {
  async getRates(params: ShippingRateParams): Promise<ShippingRate[]> {
    const dbRates = await prisma.shippingRate.findMany({
      where: { wilayaId: params.toWilayaCode, isActive: true },
    });

    if (dbRates.length === 0) {
      // Fallback: get default rate (wilayaId = 0 means national default)
      const defaultRate = await prisma.shippingRate.findFirst({
        where: { wilayaId: 0, isActive: true },
      });

      if (defaultRate) {
        const rates: ShippingRate[] = [{
          provider: "MANUAL",
          service: "Standard Delivery",
          price: Number(defaultRate.homeDelivery),
          currency: "DZD",
          estimatedDays: defaultRate.estimatedDays || 0,
          isStopDesk: false,
        }];
        if (Number(defaultRate.officeDelivery) > 0) {
          rates.push({
            provider: "MANUAL",
            service: "Desk Pickup",
            price: Number(defaultRate.officeDelivery),
            currency: "DZD",
            estimatedDays: Math.max(1, (defaultRate.estimatedDays || 0) - 1),
            isStopDesk: true,
          });
        }
        return rates;
      }

      return [];
    }

    const rates: ShippingRate[] = [];
    for (const rate of dbRates) {
      rates.push({
        provider: "MANUAL",
        service: `${rate.provider} - Home`,
        price: Number(rate.homeDelivery),
        currency: "DZD",
        estimatedDays: rate.estimatedDays || 0,
        isStopDesk: false,
      });
      if (Number(rate.officeDelivery) > 0) {
        rates.push({
          provider: "MANUAL",
          service: `${rate.provider} - Desk`,
          price: Number(rate.officeDelivery),
          currency: "DZD",
          estimatedDays: Math.max(1, (rate.estimatedDays || 0) - 1),
          isStopDesk: true,
        });
      }
    }

    return rates;
  }

  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    // Manual: no API call. Generate a reference for admin tracking.
    const trackingNumber = `MAN-${params.orderNumber}-${Date.now().toString(36).toUpperCase()}`;

    return {
      provider: "MANUAL",
      trackingNumber,
      raw: {
        note: "Shipment created manually. Admin will handle delivery.",
        recipient: params.recipientName,
        address: params.recipientAddress,
        phone: params.recipientPhone,
      },
    };
  }

  async track(_trackingNumber: string): Promise<TrackingResult> {
    // Manual tracking — admin updates order status directly
    return {
      provider: "MANUAL",
      trackingNumber: _trackingNumber,
      currentStatus: "Contact the store for tracking updates.",
      events: [],
    };
  }

  async cancel(_trackingNumber: string): Promise<CancelResult> {
    return {
      success: true,
      message: "Manual shipment marked as cancelled. Contact admin for confirmation.",
    };
  }

  async getLabel(_trackingNumber: string): Promise<string | null> {
    return null;
  }
}
