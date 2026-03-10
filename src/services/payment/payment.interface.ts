export interface PaymentInitiateParams {
  orderId: string;
  orderNumber: string;
  amount: number; // in DZD
  currency?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  description?: string;
  successUrl?: string;
  failureUrl?: string;
  webhookUrl?: string;
}

export interface PaymentInitiateResult {
  gatewayId: string; // External payment ID
  checkoutUrl?: string; // Redirect URL for online payments
  status: "pending" | "requires_action";
  raw?: unknown; // Full gateway response for debugging
}

export interface WebhookResult {
  orderId: string;
  gatewayId: string;
  status: "paid" | "failed" | "refunded";
  amount: number;
  raw?: unknown;
}

export interface PaymentStatusResult {
  gatewayId: string;
  status: "pending" | "paid" | "failed" | "refunded";
  amount: number;
  paidAt?: Date;
}

export interface RefundResult {
  gatewayId: string;
  refundId: string;
  status: "refunded" | "partially_refunded" | "failed";
  amount: number;
}

export interface IPaymentGateway {
  /** Initialize a payment and get checkout URL or instructions */
  initiate(params: PaymentInitiateParams): Promise<PaymentInitiateResult>;

  /** Process webhook from the payment gateway */
  handleWebhook(body: Buffer | string, headers: Record<string, string>): Promise<WebhookResult>;

  /** Check current payment status with the gateway */
  getStatus(gatewayId: string): Promise<PaymentStatusResult>;

  /** Request a refund */
  refund(gatewayId: string, amount?: number): Promise<RefundResult>;
}
