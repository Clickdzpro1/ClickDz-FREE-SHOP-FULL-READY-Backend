import { IShippingProvider } from "./shipping.interface";
import { YalidineProvider } from "./providers/yalidine.provider";
import { ZrExpressProvider } from "./providers/zrexpress.provider";
import { EmsProvider } from "./providers/ems.provider";
import { MaystroProvider } from "./providers/maystro.provider";
import { ManualProvider } from "./providers/manual.provider";

export type ShippingProviderKey =
  | "YALIDINE"
  | "ZR_EXPRESS"
  | "EMS_POSTE"
  | "MAYSTRO"
  | "MANUAL";

const providers: Record<string, IShippingProvider> = {};

export function getShippingProvider(key: ShippingProviderKey): IShippingProvider {
  if (!providers[key]) {
    switch (key) {
      case "YALIDINE":
        providers[key] = new YalidineProvider();
        break;
      case "ZR_EXPRESS":
        providers[key] = new ZrExpressProvider();
        break;
      case "EMS_POSTE":
        providers[key] = new EmsProvider();
        break;
      case "MAYSTRO":
        providers[key] = new MaystroProvider();
        break;
      case "MANUAL":
        providers[key] = new ManualProvider();
        break;
      default:
        throw new Error(`Unknown shipping provider: ${key}`);
    }
  }
  return providers[key];
}

export function listShippingProviders(): { key: ShippingProviderKey; name: string }[] {
  return [
    { key: "YALIDINE", name: "Yalidine" },
    { key: "ZR_EXPRESS", name: "ZR Express" },
    { key: "EMS_POSTE", name: "EMS Poste Algérie" },
    { key: "MAYSTRO", name: "Maystro Delivery" },
    { key: "MANUAL", name: "Manual / Store Delivery" },
  ];
}
