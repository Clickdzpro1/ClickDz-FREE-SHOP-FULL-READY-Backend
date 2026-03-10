import { Router } from "express";
import authRoutes from "./auth.routes";
import geoRoutes from "./geo.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import cartRoutes from "./cart.routes";
import addressRoutes from "./address.routes";
import orderRoutes from "./order.routes";
import reviewRoutes from "./review.routes";
import couponRoutes from "./coupon.routes";
import settingsRoutes from "./settings.routes";
import paymentRoutes from "./payment.routes";
import shippingRoutes from "./shipping.routes";
import adminRoutes from "./admin.routes";
import wishlistRoutes from "./wishlist.routes";
import notificationRoutes from "./notification.routes";
import stockAlertRoutes from "./stockAlert.routes";
import twoFactorRoutes from "./twoFactor.routes";
import recommendationRoutes from "./recommendation.routes";
import returnRoutes from "./return.routes";
import giftCardRoutes from "./giftCard.routes";
import loyaltyRoutes from "./loyalty.routes";
import newsletterRoutes from "./newsletter.routes";
import bundleRoutes from "./bundle.routes";
import subscriptionRoutes from "./subscription.routes";
import vendorRoutes from "./vendor.routes";
import webhookRoutes from "./webhook.routes";
import searchRoutes from "./search.routes";
import bulkRoutes from "./bulk.routes";
import auditLogRoutes from "./auditLog.routes";
import socialLoginRoutes from "./socialLogin.routes";

const router = Router();

// Existing routes
router.use("/auth", authRoutes);
router.use("/geo", geoRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/addresses", addressRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/coupons", couponRoutes);
router.use("/settings", settingsRoutes);
router.use("/payments", paymentRoutes);
router.use("/shipping", shippingRoutes);
router.use("/admin", adminRoutes);

// New feature routes
router.use("/wishlist", wishlistRoutes);
router.use("/notifications", notificationRoutes);
router.use("/stock-alerts", stockAlertRoutes);
router.use("/2fa", twoFactorRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/returns", returnRoutes);
router.use("/gift-cards", giftCardRoutes);
router.use("/loyalty", loyaltyRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/bundles", bundleRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/vendors", vendorRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/search", searchRoutes);
router.use("/admin/bulk", bulkRoutes);
router.use("/admin/audit-logs", auditLogRoutes);
router.use("/social", socialLoginRoutes);

export default router;
