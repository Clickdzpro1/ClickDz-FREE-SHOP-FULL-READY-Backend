import { Router } from "express";
import * as ctrl from "../controllers/wishlist.controller";
import { authenticate } from "../middleware";
import { validate } from "../middleware";
import { addWishlistItemSchema, removeWishlistItemSchema } from "../schemas/wishlist.schema";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.getWishlist);
router.post("/items", validate(addWishlistItemSchema), ctrl.addItem);
router.delete("/items", validate(removeWishlistItemSchema), ctrl.removeItem);
router.delete("/", ctrl.clearWishlist);
router.get("/check/:productId", ctrl.checkItem);

export default router;
