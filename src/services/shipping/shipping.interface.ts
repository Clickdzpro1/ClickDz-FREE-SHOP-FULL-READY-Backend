/**
 * Shipping provider interface — Strategy pattern.
 * Each courier implements this interface.
 */

export interface ShippingRateParams {
  fromWilayaCode: number;
  toWilayaCode: number;
  weight?: number; // kg
  isStopDesk?: boolean; // pick-up point vs home delivery
}

export interface ShippingRate {
  provider: string;
  service: string;
  price: number;
  currency: string;
  estimatedDays: number;
  isStopDesk: boolean;
}

export interface CreateShipmentParams {
  orderId: string;
  orderNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderWilayaCode: number;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientWilayaCode: number;
  recipientCommuneName?: string;
  weight?: number;
  value: number; // declared value in DZD
  isStopDesk?: boolean;
  stopDeskId?: string;
  notes?: string;
  isCod?: boolean;
  codAmount?: number;
}

export interface ShipmentResult {
  provider: string;
  trackingNumber: string;
  labelUrl?: string;
  estimatedDelivery?: string;
  raw?: unknown;
}

export interface TrackingEvent {
  date: string;
  status: string;
  location?: string;
  description?: string;
}

export interface TrackingResult {
  provider: string;
  trackingNumber: string;
  currentStatus: string;
  events: TrackingEvent[];
  raw?: unknown;
}

export interface CancelResult {
  success: boolean;
  message: string;
}

export interface IShippingProvider {
  /** Get shipping rates for a route */
  getRates(params: ShippingRateParams): Promise<ShippingRate[]>;

  /** Create a shipment / parcel */
  createShipment(params: CreateShipmentParams): Promise<ShipmentResult>;

  /** Track a shipment */
  track(trackingNumber: string): Promise<TrackingResult>;

  /** Cancel a shipment */
  cancel(trackingNumber: string): Promise<CancelResult>;

  /** Get shipping label URL */
  getLabel(trackingNumber: string): Promise<string | null>;
}
