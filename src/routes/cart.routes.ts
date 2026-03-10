import { Router } from "express";
import * as ctrl from "../controllers/cart.controller";
import { authenticate, validate } from "../middleware";
import { addToCartSchema, updateCartItemSchema } from "../schemas/cart.schema";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.getCart);
router.post("/items", validate(addToCartSchema), ctrl.addToCart);
router.patch("/items/:itemId", validate(updateCartItemSchema), ctrl.updateCartItem);
router.delete("/items/:itemId", ctrl.removeCartItem);
router.delete("/", ctrl.clearCart);

export default router;
