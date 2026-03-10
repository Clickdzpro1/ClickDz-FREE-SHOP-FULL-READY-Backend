import { Router } from "express";
import * as ctrl from "../controllers/bulk.controller";
import { authenticate, adminGuard, validate } from "../middleware";
import {
  bulkUpdatePricesSchema,
  bulkUpdateStockSchema,
  bulkProductIdsSchema,
  bulkOrderStatusSchema,
  bulkDeleteReviewsSchema,
  bulkImportProductsSchema,
} from "../schemas/bulk.schema";

const router = Router();

router.use(authenticate, adminGuard);

router.post("/products/prices", validate(bulkUpdatePricesSchema), ctrl.bulkUpdatePrices);
router.post("/products/stock", validate(bulkUpdateStockSchema), ctrl.bulkUpdateStock);
router.post("/products/deactivate", validate(bulkProductIdsSchema), ctrl.bulkDeactivateProducts);
router.post("/products/activate", validate(bulkProductIdsSchema), ctrl.bulkActivateProducts);
router.post("/products/import", validate(bulkImportProductsSchema), ctrl.bulkImportProducts);
router.post("/orders/status", validate(bulkOrderStatusSchema), ctrl.bulkUpdateOrderStatus);
router.post("/reviews/delete", validate(bulkDeleteReviewsSchema), ctrl.bulkDeleteReviews);

export default router;
