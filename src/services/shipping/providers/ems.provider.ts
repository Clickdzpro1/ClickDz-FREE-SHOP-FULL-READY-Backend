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
 * EMS — Algeria Post express mail service.
 * Used for domestic and international express parcels.
 */
export class EmsProvider implements IShippingProvider {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.shipping.ems.baseUrl;
    this.apiKey = config.shipping.ems.apiKey;
  }

  private headers() {
    return {
      "X-API-Key": this.apiKey,
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
      throw new Error(`EMS API error ${res.status}: ${text}`);
    }
    return res.json();
  }

  async getRates(params: ShippingRateParams): Promise<ShippingRate[]> {
    const data = await this.request("/rates", {
      method: "POST",
      body: JSON.stringify({
        from_wilaya: params.fromWilayaCode,
        to_wilaya: params.toWilayaCode,
        weight: params.weight || 1,
      }),
    });

    const rates: ShippingRate[] = [];
    if (data?.express) {
      rates.push({
        provider: "EMS_POSTE",
        service: "EMS Express",
        price: data.express.price || data.express,
        currency: "DZD",
        estimatedDays: data.express.days || 4,
        isStopDesk: false,
      });
    }
    if (data?.standard) {
      rates.push({
        provider: "EMS_POSTE",
        service: "EMS Standard",
        price: data.standard.price || data.standard,
        currency: "DZD",
        estimatedDays: data.standard.days || 7,
        isStopDesk: false,
      });
    }

    return rates;
  }

  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    const body = {
      reference: params.orderNumber,
      sender: {
        name: params.senderName,
        phone: params.senderPhone,
        address: params.senderAddress,
        wilaya: params.senderWilayaCode,
      },
      recipient: {
        name: params.recipientName,
        phone: params.recipientPhone,
        address: params.recipientAddress,
        wilaya: params.recipientWilayaCode,
        commune: params.recipientCommuneName || "",
      },
      parcel: {
        weight: params.weight || 1,
        value: params.value,
        description: `Order ${params.orderNumber}`,
      },
      cod: params.isCod ? params.codAmount || 0 : 0,
      notes: params.notes || "",
    };

    const data = await this.request("/shipments", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return {
      provider: "EMS_POSTE",
      trackingNumber: data?.tracking_number || data?.barcode || "",
      labelUrl: data?.label_url || undefined,
      estimatedDelivery: data?.estimated_delivery || undefined,
      raw: data,
    };
  }

  async track(trackingNumber: string): Promise<TrackingResult> {
    const data = await this.request(`/tracking/${trackingNumber}`);

    return {
      provider: "EMS_POSTE",
      trackingNumber,
      currentStatus: data?.current_status || data?.status || "unknown",
      events: (data?.events || data?.history || []).map((e: any) => ({
        date: e.date || e.timestamp || "",
        status: e.status || e.event || "",
        location: e.location || e.office || undefined,
        description: e.description || e.details || undefined,
      })),
      raw: data,
    };
  }

  async cancel(trackingNumber: string): Promise<CancelResult> {
    try {
      await this.request(`/shipments/${trackingNumber}/cancel`, { method: "POST" });
      return { success: true, message: "EMS shipment cancelled" };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async getLabel(trackingNumber: string): Promise<string | null> {
    try {
      const data = await this.request(`/shipments/${trackingNumber}/label`);
      return data?.url || null;
    } catch {
      return null;
    }
  }
}
