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
 * Yalidine — one of Algeria's top courier services.
 * API docs: https://docs.yalidine.com
 */
export class YalidineProvider implements IShippingProvider {
  private baseUrl: string;
  private apiId: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = config.shipping.yalidine.baseUrl;
    this.apiId = config.shipping.yalidine.apiId;
    this.apiToken = config.shipping.yalidine.apiToken;
  }

  private headers() {
    return {
      "X-API-ID": this.apiId,
      "X-API-TOKEN": this.apiToken,
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
      throw new Error(`Yalidine API error ${res.status}: ${text}`);
    }
    return res.json();
  }

  async getRates(params: ShippingRateParams): Promise<ShippingRate[]> {
    const data = await this.request(
      `/deliveryfees/?from_wilaya_id=${params.fromWilayaCode}&to_wilaya_id=${params.toWilayaCode}`
    );

    const rates: ShippingRate[] = [];
    if (data) {
      const item = Array.isArray(data) ? data[0] : data;
      if (item?.home_fee != null) {
        rates.push({
          provider: "YALIDINE",
          service: "Home Delivery",
          price: item.home_fee,
          currency: "DZD",
          estimatedDays: item.estimated_days || 3,
          isStopDesk: false,
        });
      }
      if (item?.desk_fee != null) {
        rates.push({
          provider: "YALIDINE",
          service: "Stop Desk",
          price: item.desk_fee,
          currency: "DZD",
          estimatedDays: item.estimated_days || 2,
          isStopDesk: true,
        });
      }
    }

    return rates;
  }

  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    const body = {
      order_id: params.orderNumber,
      firstname: params.recipientName.split(" ")[0] || params.recipientName,
      familyname: params.recipientName.split(" ").slice(1).join(" ") || "",
      contact_phone: params.recipientPhone,
      address: params.recipientAddress,
      to_wilaya_id: params.recipientWilayaCode,
      to_commune_name: params.recipientCommuneName || "",
      product_list: `Order ${params.orderNumber}`,
      price: params.isCod ? params.codAmount || params.value : 0,
      declared_value: params.value,
      is_stopdesk: params.isStopDesk ? 1 : 0,
      stopdesk_id: params.stopDeskId || null,
      freeshipping: !params.isCod,
      note: params.notes || "",
      weight: params.weight || 1,
    };

    const data = await this.request("/parcels/", {
      method: "POST",
      body: JSON.stringify([body]),
    });

    const parcel = Array.isArray(data) ? data[0] : data;
    return {
      provider: "YALIDINE",
      trackingNumber: parcel?.tracking || parcel?.id || "",
      labelUrl: parcel?.label_url || undefined,
      estimatedDelivery: undefined,
      raw: parcel,
    };
  }

  async track(trackingNumber: string): Promise<TrackingResult> {
    const data = await this.request(`/parcels/${trackingNumber}/`);

    return {
      provider: "YALIDINE",
      trackingNumber,
      currentStatus: data?.last_status || "unknown",
      events: (data?.history || []).map((e: any) => ({
        date: e.date || "",
        status: e.status || "",
        location: e.center || undefined,
        description: e.note || undefined,
      })),
      raw: data,
    };
  }

  async cancel(trackingNumber: string): Promise<CancelResult> {
    try {
      await this.request(`/parcels/${trackingNumber}/`, { method: "DELETE" });
      return { success: true, message: "Shipment cancelled" };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async getLabel(trackingNumber: string): Promise<string | null> {
    const data = await this.request(`/parcels/${trackingNumber}/`);
    return data?.label_url || null;
  }
}
