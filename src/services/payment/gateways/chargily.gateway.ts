import crypto from "crypto";
import { config } from "../../../config";
import {
  IPaymentGateway,
  PaymentInitiateParams,
  PaymentInitiateResult,
  WebhookResult,
  PaymentStatusResult,
  RefundResult,
} from "../payment.interface";

type ChargilyMode = "EDAHABIA" | "CIB";

/**
 * Chargily Pay gateway — supports EDAHABIA and CIB cards.
 * Docs: https://dev.chargily.com/pay-v2/
 */
export class ChargilyGateway implements IPaymentGateway {
  private baseUrl: string;
  private apiKey: string;
  private secret: string;
  private mode: ChargilyMode;

  constructor(mode: ChargilyMode) {
    this.mode = mode;
    this.baseUrl = config.chargily.baseUrl;
    this.apiKey = config.chargily.apiKey;
    this.secret = config.chargily.secretKey;
  }

  async initiate(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    const response = await fetch(`${this.baseUrl}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: "DZD",
        payment_method: this.mode === "EDAHABIA" ? "edahabia" : "cib",
        success_url: params.successUrl || `${config.app.frontendUrl}/payment/success`,
        failure_url: params.failureUrl || `${config.app.frontendUrl}/payment/failure`,
        webhook_endpoint: params.webhookUrl || `${config.app.baseUrl}/api/v1/payments/webhooks/chargily`,
        description: params.description || `Order ${params.orderNumber}`,
        locale: "fr",
        metadata: {
          order_id: params.orderId,
          order_number: params.orderNumber,
        },
        customer: {
          name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone,
        },
      }),
    });

    const data: any = await response.json();
    if (!response.ok) {
      throw new Error(`Chargily error: ${JSON.stringify(data)}`);
    }

    return {
      gatewayId: data.id,
      checkoutUrl: data.checkout_url,
      status: "requires_action",
      raw: data,
    };
  }

  async handleWebhook(body: Buffer | string, headers: Record<string, string>): Promise<WebhookResult> {
    const signature = headers["signature"] || headers["Signature"];
    const payload = typeof body === "string" ? body : body.toString("utf8");

    // Verify HMAC signature with timing-safe comparison
    if (!signature) {
      throw new Error("Missing Chargily webhook signature");
    }

    const computed = crypto
      .createHmac("sha256", this.secret)
      .update(payload)
      .digest("hex");

    const computedBuf = Buffer.from(computed, "utf8");
    const signatureBuf = Buffer.from(signature, "utf8");
    if (computedBuf.length !== signatureBuf.length || !crypto.timingSafeEqual(computedBuf, signatureBuf)) {
      throw new Error("Invalid Chargily webhook signature");
    }

    const event = JSON.parse(payload);
    const checkout = event.data;

    let status: "paid" | "failed" = "failed";
    if (event.type === "checkout.paid") status = "paid";
    if (event.type === "checkout.failed") status = "failed";

    return {
      orderId: checkout.metadata?.order_id,
      gatewayId: checkout.id,
      status,
      amount: checkout.amount,
      raw: event,
    };
  }

  async getStatus(gatewayId: string): Promise<PaymentStatusResult> {
    const response = await fetch(`${this.baseUrl}/checkouts/${gatewayId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    const data: any = await response.json();

    const statusMap: Record<string, "pending" | "paid" | "failed"> = {
      pending: "pending",
      paid: "paid",
      failed: "failed",
      canceled: "failed",
      expired: "failed",
    };

    return {
      gatewayId: data.id,
      status: statusMap[data.status] || "pending",
      amount: data.amount,
      paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
    };
  }

  async refund(gatewayId: string, amount?: number): Promise<RefundResult> {
    const response = await fetch(`${this.baseUrl}/refunds`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_id: gatewayId,
        amount,
      }),
    });

    const data: any = await response.json();
    if (!response.ok) throw new Error(`Chargily refund error: ${JSON.stringify(data)}`);

    return {
      gatewayId,
      refundId: data.id,
      status: amount ? "partially_refunded" : "refunded",
      amount: data.amount,
    };
  }
}
