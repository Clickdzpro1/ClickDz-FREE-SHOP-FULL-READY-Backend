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

const router = Router();

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

export default router;
