import { Router } from "express";
import * as ctrl from "../controllers/product.controller";
import { authenticate, adminGuard, validate, uploadSingle } from "../middleware";
import { createProductSchema, updateProductSchema, productQuerySchema } from "../schemas/product.schema";

const router = Router();

// Public
router.get("/", validate(productQuerySchema, "query"), ctrl.listProducts);
router.get("/featured", ctrl.getFeaturedProducts);
router.get("/:slug", ctrl.getProduct);

// Admin
router.post("/", authenticate, adminGuard, validate(createProductSchema), ctrl.createProduct);
router.put("/:id", authenticate, adminGuard, validate(updateProductSchema), ctrl.updateProduct);
router.delete("/:id", authenticate, adminGuard, ctrl.deleteProduct);
router.post("/:id/images", authenticate, adminGuard, uploadSingle, ctrl.addProductImage);
router.delete("/:id/images/:imageId", authenticate, adminGuard, ctrl.deleteProductImage);

export default router;
