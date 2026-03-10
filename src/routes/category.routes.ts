import { Router } from "express";
import * as ctrl from "../controllers/category.controller";
import { authenticate, adminGuard, validate } from "../middleware";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema";

const router = Router();

// Public
router.get("/", ctrl.listCategories);
router.get("/tree", ctrl.getCategoryTree);
router.get("/:slug", ctrl.getCategory);

// Admin
router.get("/admin/all", authenticate, adminGuard, ctrl.listAllCategories);
router.post("/", authenticate, adminGuard, validate(createCategorySchema), ctrl.createCategory);
router.put("/:id", authenticate, adminGuard, validate(updateCategorySchema), ctrl.updateCategory);
router.delete("/:id", authenticate, adminGuard, ctrl.deleteCategory);

export default router;
