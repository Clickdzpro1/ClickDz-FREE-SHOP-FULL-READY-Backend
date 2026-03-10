import Stripe from "stripe";
import { config } from "../../../config";
import {
  IPaymentGateway,
  PaymentInitiateParams,
  PaymentInitiateResult,
  WebhookResult,
  PaymentStatusResult,
  RefundResult,
} from "../payment.interface";

/**
 * Stripe gateway — for international card payments.
 * Converts DZD amount to appropriate Stripe currency.
 */
export class StripeGateway implements IPaymentGateway {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    });
    this.webhookSecret = config.stripe.webhookSecret;
  }

  async initiate(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "dzd",
            product_data: {
              name: `Order ${params.orderNumber}`,
              description: params.description,
            },
            unit_amount: Math.round(params.amount * 100), // Stripe uses smallest unit
          },
          quantity: 1,
        },
      ],
      customer_email: params.customerEmail,
      metadata: {
        order_id: params.orderId,
        order_number: params.orderNumber,
      },
      success_url: params.successUrl || `${config.app.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.failureUrl || `${config.app.frontendUrl}/payment/cancel`,
    });

    return {
      gatewayId: session.id,
      checkoutUrl: session.url || undefined,
      status: "requires_action",
      raw: session,
    };
  }

  async handleWebhook(body: Buffer | string, headers: Record<string, string>): Promise<WebhookResult> {
    const signature = headers["stripe-signature"];
    const payload = typeof body === "string" ? Buffer.from(body) : body;

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret
    );

    if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.expired") {
      throw new Error(`Unhandled Stripe event: ${event.type}`);
    }

    const session = event.data.object as Stripe.Checkout.Session;

    return {
      orderId: session.metadata?.order_id || "",
      gatewayId: session.id,
      status: session.payment_status === "paid" ? "paid" : "failed",
      amount: (session.amount_total || 0) / 100,
      raw: event,
    };
  }

  async getStatus(gatewayId: string): Promise<PaymentStatusResult> {
    const session = await this.stripe.checkout.sessions.retrieve(gatewayId);

    const statusMap: Record<string, "pending" | "paid" | "failed"> = {
      paid: "paid",
      unpaid: "pending",
      no_payment_required: "paid",
    };

    return {
      gatewayId: session.id,
      status: statusMap[session.payment_status || "unpaid"] || "pending",
      amount: (session.amount_total || 0) / 100,
    };
  }

  async refund(gatewayId: string, amount?: number): Promise<RefundResult> {
    const session = await this.stripe.checkout.sessions.retrieve(gatewayId);
    const paymentIntentId = session.payment_intent as string;

    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return {
      gatewayId,
      refundId: refund.id,
      status: amount ? "partially_refunded" : "refunded",
      amount: (refund.amount || 0) / 100,
    };
  }
}
