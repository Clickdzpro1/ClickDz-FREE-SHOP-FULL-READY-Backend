import { Router } from "express";
import * as ctrl from "../controllers/vendor.controller";
import { authenticate, adminGuard, validate } from "../middleware";
import {
  applyVendorSchema,
  updateVendorStatusSchema,
  updateCommissionSchema,
  addVendorProductSchema,
} from "../schemas/vendor.schema";

const router = Router();

// Public
router.get("/stores", ctrl.listPublicStores);
router.get("/stores/:slug", ctrl.getStoreBySlug);

// Vendor (authenticated)
router.post("/apply", authenticate, validate(applyVendorSchema), ctrl.applyAsVendor);
router.get("/me", authenticate, ctrl.getMyProfile);
router.post("/products", authenticate, validate(addVendorProductSchema), ctrl.addProduct);
router.delete("/products/:productId", authenticate, ctrl.removeProduct);

// Admin
router.get("/admin/all", authenticate, adminGuard, ctrl.listAllVendors);
router.patch("/admin/:id/status", authenticate, adminGuard, validate(updateVendorStatusSchema), ctrl.updateVendorStatus);
router.patch("/admin/:id/commission", authenticate, adminGuard, validate(updateCommissionSchema), ctrl.updateCommission);

export default router;
