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
 * Maystro Delivery — Algerian delivery platform.
 * API docs: https://maystro-delivery.com/api
 */
export class MaystroProvider implements IShippingProvider {
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = config.shipping.maystro.baseUrl;
    this.apiToken = config.shipping.maystro.apiToken;
  }

  private headers() {
    return {
      Authorization: `Token ${this.apiToken}`,
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
      throw new Error(`Maystro API error ${res.status}: ${text}`);
    }
    return res.json();
  }

  async getRates(params: ShippingRateParams): Promise<ShippingRate[]> {
    const data = await this.request("/api/v1/fees/", {
      method: "POST",
      body: JSON.stringify({
        wilaya_from: params.fromWilayaCode,
        wilaya_to: params.toWilayaCode,
        weight: params.weight || 1,
      }),
    });

    const rates: ShippingRate[] = [];
    if (data?.home_delivery != null) {
      rates.push({
        provider: "MAYSTRO",
        service: "Home Delivery",
        price: data.home_delivery,
        currency: "DZD",
        estimatedDays: data.delay || 3,
        isStopDesk: false,
      });
    }
    if (data?.stop_desk != null) {
      rates.push({
        provider: "MAYSTRO",
        service: "Stop Desk",
        price: data.stop_desk,
        currency: "DZD",
        estimatedDays: data.delay ? data.delay - 1 : 2,
        isStopDesk: true,
      });
    }

    return rates;
  }

  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    const body = {
      external_id: params.orderNumber,
      customer_name: params.recipientName,
      customer_phone: params.recipientPhone,
      address: params.recipientAddress,
      wilaya: params.recipientWilayaCode,
      commune: params.recipientCommuneName || "",
      product_name: `Order ${params.orderNumber}`,
      price: params.isCod ? params.codAmount || params.value : 0,
      weight: params.weight || 1,
      is_stop_desk: params.isStopDesk || false,
      stop_desk: params.stopDeskId || null,
      note: params.notes || "",
      do_not_call: false,
    };

    const data = await this.request("/api/v1/orders/", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return {
      provider: "MAYSTRO",
      trackingNumber: data?.tracking || data?.code || "",
      labelUrl: data?.label || undefined,
      raw: data,
    };
  }

  async track(trackingNumber: string): Promise<TrackingResult> {
    const data = await this.request(`/api/v1/tracking/${trackingNumber}/`);

    return {
      provider: "MAYSTRO",
      trackingNumber,
      currentStatus: data?.status || "unknown",
      events: (data?.history || data?.timeline || []).map((e: any) => ({
        date: e.date || e.created_at || "",
        status: e.status || "",
        location: e.wilaya || e.center || undefined,
        description: e.note || e.comment || undefined,
      })),
      raw: data,
    };
  }

  async cancel(trackingNumber: string): Promise<CancelResult> {
    try {
      await this.request(`/api/v1/orders/${trackingNumber}/cancel/`, {
        method: "POST",
      });
      return { success: true, message: "Maystro shipment cancelled" };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async getLabel(trackingNumber: string): Promise<string | null> {
    try {
      const data = await this.request(`/api/v1/orders/${trackingNumber}/label/`);
      return data?.url || data?.label || null;
    } catch {
      return null;
    }
  }
}
