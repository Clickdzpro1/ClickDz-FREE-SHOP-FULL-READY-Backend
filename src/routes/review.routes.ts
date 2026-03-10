import { Router } from "express";
import * as ctrl from "../controllers/review.controller";
import { authenticate, adminGuard, validate } from "../middleware";
import { createReviewSchema, updateReviewSchema } from "../schemas/review.schema";

const router = Router();

// Public
router.get("/product/:productId", ctrl.listReviews);

// Customer
router.post("/", authenticate, validate(createReviewSchema), ctrl.createReview);
router.put("/:id", authenticate, validate(updateReviewSchema), ctrl.updateReview);
router.delete("/:id", authenticate, ctrl.deleteReview);

// Admin
router.get("/pending", authenticate, adminGuard, ctrl.listPendingReviews);
router.patch("/:id/approve", authenticate, adminGuard, ctrl.approveReview);
router.delete("/admin/:id", authenticate, adminGuard, ctrl.adminDeleteReview);

export default router;
