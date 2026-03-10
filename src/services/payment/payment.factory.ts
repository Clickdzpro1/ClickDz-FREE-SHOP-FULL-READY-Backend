import { IPaymentGateway } from "./payment.interface";
import { ChargilyGateway } from "./gateways/chargily.gateway";
import { SlickPayGateway } from "./gateways/slickpay.gateway";
import { StripeGateway } from "./gateways/stripe.gateway";
import { CcpGateway } from "./gateways/ccp.gateway";
import { CodGateway } from "./gateways/cod.gateway";

export type PaymentMethodKey =
  | "COD"
  | "CHARGILY_EDAHABIA"
  | "CHARGILY_CIB"
  | "SLICKPAY_EDAHABIA"
  | "SLICKPAY_CIB"
  | "STRIPE"
  | "CCP_BARIDIMOB";

const gateways: Record<PaymentMethodKey, () => IPaymentGateway> = {
  COD: () => new CodGateway(),
  CHARGILY_EDAHABIA: () => new ChargilyGateway("EDAHABIA"),
  CHARGILY_CIB: () => new ChargilyGateway("CIB"),
  SLICKPAY_EDAHABIA: () => new SlickPayGateway("EDAHABIA"),
  SLICKPAY_CIB: () => new SlickPayGateway("CIB"),
  STRIPE: () => new StripeGateway(),
  CCP_BARIDIMOB: () => new CcpGateway(),
};

export function getPaymentGateway(method: PaymentMethodKey): IPaymentGateway {
  const factory = gateways[method];
  if (!factory) {
    throw new Error(`Unsupported payment method: ${method}`);
  }
  return factory();
}
