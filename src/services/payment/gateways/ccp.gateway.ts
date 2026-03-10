import {
  IPaymentGateway,
  PaymentInitiateParams,
  PaymentInitiateResult,
  WebhookResult,
  PaymentStatusResult,
  RefundResult,
} from "../payment.interface";

/**
 * CCP / BaridiMob gateway — manual bank transfer.
 * Flow:
 *  1. Customer places order and selects CCP or BARIDIMOB.
 *  2. System shows the store's CCP/BaridiMob account details.
 *  3. Customer transfers money and uploads proof (receipt screenshot).
 *  4. Admin reviews proof and confirms or rejects payment.
 *
 * No external API — purely admin-driven.
 */
export class CcpGateway implements IPaymentGateway {
  private method: "CCP" | "BARIDIMOB";

  constructor(method: "CCP" | "BARIDIMOB" = "CCP") {
    this.method = method;
  }

  async initiate(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    // No external checkout — return instructions for manual transfer
    const gatewayId = `${this.method.toLowerCase()}_${params.orderId}_${Date.now()}`;

    return {
      gatewayId,
      status: "pending",
      raw: {
        method: this.method,
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        amount: params.amount,
        instructions: this.method === "CCP"
          ? "Please transfer the amount to our CCP account and upload the receipt."
          : "Please send the amount via BaridiMob and upload the transaction screenshot.",
      },
    };
  }

  async handleWebhook(
    _body: Buffer | string,
    _headers: Record<string, string>
  ): Promise<WebhookResult> {
    // Manual gateway — no webhook. Admin confirms via API.
    throw new Error("CCP/BaridiMob does not support webhooks. Use admin confirmation.");
  }

  async getStatus(gatewayId: string): Promise<PaymentStatusResult> {
    // Status is managed in the database by admin actions.
    // This method is a placeholder — the payment service reads from DB.
    return {
      gatewayId,
      status: "pending",
      amount: 0,
    };
  }

  async refund(gatewayId: string, amount?: number): Promise<RefundResult> {
    // Manual refund — admin handles externally
    return {
      gatewayId,
      refundId: `refund_${gatewayId}_${Date.now()}`,
      status: amount ? "partially_refunded" : "refunded",
      amount: amount || 0,
    };
  }
}
