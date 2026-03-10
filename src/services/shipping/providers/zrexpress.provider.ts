import { config } from "../../../config";
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
 * ZR Express — Algerian delivery service.
 * API docs: https://zrexpress.com/api
 */
export class ZrExpressProvider implements IShippingProvider {
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = config.shipping.zrExpress.baseUrl;
    this.apiToken = config.shipping.zrExpress.apiToken;
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
    };
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { ...this.headers(), ...(options.headers || {}) },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ZR Express API error ${res.status}: ${text}`);
    }
    return res.json();
  }

  async getRates(params: ShippingRateParams): Promise<ShippingRate[]> {
    const data = await this.request("/fees", {
      method: "POST",
      body: JSON.stringify({
        from_wilaya: params.fromWilayaCode,
        to_wilaya: params.toWilayaCode,
        weight: params.weight || 1,
      }),
    });

    const rates: ShippingRate[] = [];
    if (data?.home) {
      rates.push({
        provider: "ZR_EXPRESS",
        service: "Home Delivery",
        price: data.home,
        currency: "DZD",
        estimatedDays: data.estimated_days || 3,
        isStopDesk: false,
      });
    }
    if (data?.stopdesk) {
      rates.push({
        provider: "ZR_EXPRESS",
        service: "Stop Desk",
        price: data.stopdesk,
        currency: "DZD",
        estimatedDays: data.estimated_days || 2,
        isStopDesk: true,
      });
    }

    return rates;
  }

  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    const body = {
      reference: params.orderNumber,
      name: params.recipientName,
      phone: params.recipientPhone,
      address: params.recipientAddress,
      wilaya_id: params.recipientWilayaCode,
      commune: params.recipientCommuneName || "",
      product: `Order ${params.orderNumber}`,
      price: params.isCod ? params.codAmount || params.value : 0,
      weight: params.weight || 1,
      is_stopdesk: params.isStopDesk || false,
      stopdesk_id: params.stopDeskId || null,
      note: params.notes || "",
    };

    const data = await this.request("/orders", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return {
      provider: "ZR_EXPRESS",
      trackingNumber: data?.tracking || data?.id?.toString() || "",
      labelUrl: data?.label_url || undefined,
      raw: data,
    };
  }

  async track(trackingNumber: string): Promise<TrackingResult> {
    const data = await this.request(`/tracking/${trackingNumber}`);

    return {
      provider: "ZR_EXPRESS",
      trackingNumber,
      currentStatus: data?.status || "unknown",
      events: (data?.timeline || data?.history || []).map((e: any) => ({
        date: e.date || e.created_at || "",
        status: e.status || "",
        location: e.center || e.wilaya || undefined,
        description: e.note || e.comment || undefined,
      })),
      raw: data,
    };
  }

  async cancel(trackingNumber: string): Promise<CancelResult> {
    try {
      await this.request(`/orders/${trackingNumber}/cancel`, { method: "POST" });
      return { success: true, message: "Shipment cancelled" };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async getLabel(trackingNumber: string): Promise<string | null> {
    const data = await this.request(`/orders/${trackingNumber}/label`);
    return data?.url || null;
  }
}
