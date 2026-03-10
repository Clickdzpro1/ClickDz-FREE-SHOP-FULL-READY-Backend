import {
  IPaymentGateway,
  PaymentInitiateParams,
  PaymentInitiateResult,
  WebhookResult,
  PaymentStatusResult,
  RefundResult,
} from "../payment.interface";

/**
 * Cash on Delivery gateway.
 * Payment is collected when the courier delivers the order.
 * Status automatically moves to "paid" when order is marked DELIVERED.
 */
export class CodGateway implements IPaymentGateway {
  async initiate(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    const gatewayId = `cod_${params.orderId}_${Date.now()}`;

    return {
      gatewayId,
      status: "pending",
      raw: {
        method: "COD",
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        amount: params.amount,
        note: "Payment will be collected upon delivery.",
      },
    };
  }

  async handleWebhook(
    _body: Buffer | string,
    _headers: Record<string, string>
  ): Promise<WebhookResult> {
    throw new Error("COD does not support webhooks. Payment is confirmed on delivery.");
  }

  async getStatus(gatewayId: string): Promise<PaymentStatusResult> {
    // COD status is managed by order delivery status
    return {
      gatewayId,
      status: "pending",
      amount: 0,
    };
  }

  async refund(gatewayId: string, amount?: number): Promise<RefundResult> {
    // COD refund = return the cash. Handled manually.
    return {
      gatewayId,
      refundId: `refund_${gatewayId}_${Date.now()}`,
      status: amount ? "partially_refunded" : "refunded",
      amount: amount || 0,
    };
  }
}
