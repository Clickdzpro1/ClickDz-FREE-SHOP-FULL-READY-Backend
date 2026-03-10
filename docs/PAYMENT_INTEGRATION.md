# Payment Integration Guide

## Architecture

Payments use a **Strategy + Factory** pattern. Each payment gateway implements a common `IPaymentGateway` interface, and the factory selects the correct implementation at runtime.

```
src/services/payment/
  payment.interface.ts    # IPaymentGateway interface
  payment.factory.ts      # Maps PaymentMethod enum to gateway
  payment.service.ts      # Orchestrator (checkout flow)
  gateways/
    chargily.gateway.ts   # Chargily Pay (EDAHABIA/CIB)
    slickpay.gateway.ts   # SlickPay (EDAHABIA/CIB)
    stripe.gateway.ts     # Stripe (international cards)
    ccp.gateway.ts        # Manual CCP/BaridiMob
    cod.gateway.ts        # Cash on Delivery
```

## Supported Gateways

| Gateway | Methods | Auto-capture | Webhook |
|---------|---------|-------------|---------|
| Chargily Pay | EDAHABIA, CIB | Yes | HMAC-SHA256 |
| SlickPay | EDAHABIA, CIB | Yes | HMAC-SHA256 |
| Stripe | Visa, Mastercard | Yes | Stripe signature |
| CCP/BaridiMob | Manual transfer | No (admin confirms) | N/A |
| COD | Cash on Delivery | No (paid on delivery) | N/A |

## Checkout Flow

1. Customer places order (`POST /api/v1/orders`)
2. Frontend calls `POST /api/v1/payments/:orderId/initiate`
3. For online gateways: returns a `checkoutUrl` — redirect customer there
4. Gateway processes payment and sends webhook to our endpoint
5. Webhook handler verifies signature, updates order status
6. For CCP: customer uploads payment proof, admin confirms via `POST /api/v1/payments/:orderId/confirm`

## Adding a New Payment Gateway

1. Create `src/services/payment/gateways/newgateway.gateway.ts`:

```typescript
import { IPaymentGateway, PaymentInitResult, WebhookResult } from "../payment.interface";

export class NewGatewayPayment implements IPaymentGateway {
  async initiate(order: any): Promise<PaymentInitResult> {
    // Call gateway API, return checkout URL
    return { checkoutUrl: "https://...", transactionId: "..." };
  }

  async handleWebhook(body: Buffer, headers: Record<string, string>): Promise<WebhookResult> {
    // Verify signature, return payment status
    return { status: "PAID", transactionId: "..." };
  }

  async getStatus(transactionId: string): Promise<string> {
    return "PAID";
  }

  async refund(transactionId: string, amount?: number): Promise<any> {
    // Call gateway refund API
  }
}
```

2. Register in `src/services/payment/payment.factory.ts`:

```typescript
case "NEW_GATEWAY":
  return new NewGatewayPayment();
```

3. Add webhook route in `src/routes/payment.routes.ts`

4. Add the payment method to the Prisma `PaymentMethod` enum

## Webhook Security

All webhooks verify signatures before processing:

- **Chargily**: HMAC-SHA256 using timing-safe comparison (`crypto.timingSafeEqual`)
- **SlickPay**: HMAC-SHA256 with private key
- **Stripe**: `stripe.webhooks.constructEvent()` with webhook secret

The webhook endpoints receive raw request bodies (configured in `app.ts`):
```typescript
app.use("/api/v1/payments/webhooks", express.raw({ type: "application/json" }));
```
