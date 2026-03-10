import { Router } from "express";
import * as ctrl from "../controllers/giftCard.controller";
import { authenticate, adminGuard, validate } from "../middleware";
import { createGiftCardSchema, redeemGiftCardSchema } from "../schemas/giftCard.schema";

const router = Router();

// Customer routes
router.post("/", authenticate, validate(createGiftCardSchema), ctrl.createGiftCard);
router.post("/redeem", authenticate, validate(redeemGiftCardSchema), ctrl.redeemGiftCard);
router.get("/balance/:code", ctrl.checkBalance);
router.get("/mine", authenticate, ctrl.getMyGiftCards);

// Admin routes
router.patch("/admin/:id/disable", authenticate, adminGuard, ctrl.disableGiftCard);

export default router;
