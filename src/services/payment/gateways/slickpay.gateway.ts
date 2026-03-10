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

type SlickPayMode = "EDAHABIA" | "CIB";

/**
 * SlickPay gateway — supports EDAHABIA and CIB.
 * Docs: https://devapi.slick-pay.com
 */
export class SlickPayGateway implements IPaymentGateway {
  private baseUrl: string;
  private publicKey: string;
  private mode: SlickPayMode;

  constructor(mode: SlickPayMode) {
    this.mode = mode;
    this.baseUrl = config.slickpay.baseUrl;
    this.publicKey = config.slickpay.publicKey;
  }

  async initiate(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    const response = await fetch(`${this.baseUrl}/users/invoices`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.publicKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: params.amount,
        note: params.description || `Order ${params.orderNumber}`,
        fname: params.customerName.split(" ")[0],
        lname: params.customerName.split(" ").slice(1).join(" ") || "Customer",
        email: params.customerEmail,
        phone: params.customerPhone,
        address: "Algeria",
        items: [
          {
            name: `Order ${params.orderNumber}`,
            price: params.amount,
            quantity: 1,
          },
        ],
        webhook_url: params.webhookUrl || `${config.app.baseUrl}/api/v1/payments/webhooks/slickpay`,
        return_url: params.successUrl || `${config.app.frontendUrl}/payment/success`,
      }),
    });

    const data: any = await response.json();
    if (!response.ok) {
      throw new Error(`SlickPay error: ${JSON.stringify(data)}`);
    }

    return {
      gatewayId: data.id?.toString() || data.invoice_number,
      checkoutUrl: data.url || data.payment_url,
      status: "requires_action",
      raw: data,
    };
  }

  async handleWebhook(body: Buffer | string, headers: Record<string, string>): Promise<WebhookResult> {
    const payload = typeof body === "string" ? body : body.toString("utf8");
    const event = JSON.parse(payload);

    // SlickPay sends invoice status updates
    return {
      orderId: event.metadata?.order_id || event.order_id,
      gatewayId: event.id?.toString() || event.invoice_number,
      status: event.status === "paid" ? "paid" : "failed",
      amount: event.amount,
      raw: event,
    };
  }

  async getStatus(gatewayId: string): Promise<PaymentStatusResult> {
    const response = await fetch(`${this.baseUrl}/users/invoices/${gatewayId}`, {
      headers: {
        Authorization: `Bearer ${this.publicKey}`,
        Accept: "application/json",
      },
    });
    const data: any = await response.json();

    return {
      gatewayId,
      status: data.status === "paid" ? "paid" : data.status === "pending" ? "pending" : "failed",
      amount: data.amount,
      paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
    };
  }

  async refund(_gatewayId: string, _amount?: number): Promise<RefundResult> {
    // SlickPay refunds are typically handled manually
    throw new Error("SlickPay refunds must be processed manually through the dashboard");
  }
}
