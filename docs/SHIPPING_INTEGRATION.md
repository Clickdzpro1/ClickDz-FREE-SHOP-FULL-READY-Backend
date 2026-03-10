# Shipping Integration Guide

## Architecture

Shipping uses a **Strategy + Factory** pattern identical to payments.

```
src/services/shipping/
  shipping.interface.ts    # IShippingProvider interface
  shipping.factory.ts      # Maps provider key to implementation
  shipping.service.ts      # Orchestrator
  providers/
    yalidine.provider.ts   # Yalidine API
    zrexpress.provider.ts  # ZR Express API
    ems.provider.ts        # EMS (Poste Algerie)
    maystro.provider.ts    # Maystro Delivery
    manual.provider.ts     # Admin-managed rates
```

## Supported Providers

| Provider | Coverage | Tracking | Labels | COD Support |
|----------|----------|----------|--------|-------------|
| Yalidine | 58 wilayas | Yes | Yes | Yes |
| ZR Express | 58 wilayas | Yes | Yes | Yes |
| EMS | 58 wilayas | Yes | Yes | No |
| Maystro | 58 wilayas | Yes | Yes | Yes |
| Manual | Custom | N/A | N/A | N/A |

## Shipping Flow

1. Customer selects wilaya during checkout
2. Frontend calls `GET /api/v1/shipping/rates?wilayaCode=16` to get rates
3. Customer chooses a provider + delivery type (home/office)
4. Order is placed with shipping info
5. Admin creates shipment: `POST /api/v1/shipping/:orderId/ship`
6. Customer tracks: `GET /api/v1/shipping/:orderId/track`

## Rate Lookup

The shipping service queries all active providers for rates:

```
GET /api/v1/shipping/rates?wilayaCode=16

Response:
[
  {
    "provider": "YALIDINE",
    "homeDelivery": 600,
    "officeDelivery": 400,
    "estimatedDays": 2
  },
  {
    "provider": "ZREXPRESS",
    "homeDelivery": 550,
    "officeDelivery": 350,
    "estimatedDays": 3
  }
]
```

## Adding a New Shipping Provider

1. Create `src/services/shipping/providers/newprovider.provider.ts`:

```typescript
import { IShippingProvider, ShipmentResult, TrackingResult } from "../shipping.interface";

export class NewProvider implements IShippingProvider {
  async getRates(params: { fromWilayaCode: number; toWilayaCode: number }) {
    // Call provider API
    return [{ provider: "NEWPROVIDER", homeDelivery: 500, officeDelivery: 300, estimatedDays: 2 }];
  }

  async createShipment(params: any): Promise<ShipmentResult> {
    // Call provider API to create shipment
    return { trackingNumber: "...", providerOrderId: "..." };
  }

  async track(trackingNumber: string): Promise<TrackingResult> {
    // Call provider tracking API
    return { status: "IN_TRANSIT", events: [...] };
  }

  async cancel(trackingNumber: string) {
    return { success: true };
  }

  async getLabel(trackingNumber: string) {
    return { url: "https://..." };
  }
}
```

2. Register in `src/services/shipping/shipping.factory.ts`:

```typescript
case "NEWPROVIDER":
  return new NewProvider();
```

3. Add the provider to the Prisma `ShippingProvider` enum

## Admin-Managed Rates

The Manual provider reads from the `ShippingRate` database table, managed by admins:

```
POST /api/v1/admin/shipping-rates
{
  "wilayaId": 16,
  "provider": "MANUAL",
  "homeDelivery": 500,
  "officeDelivery": 300,
  "estimatedDays": 3,
  "isActive": true
}
```

This allows non-technical admins to set per-wilaya shipping rates without API integrations.
