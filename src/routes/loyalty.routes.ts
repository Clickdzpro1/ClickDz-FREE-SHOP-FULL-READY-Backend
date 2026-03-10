import { Router } from "express";
import * as ctrl from "../controllers/loyalty.controller";
import { authenticate, validate } from "../middleware";
import { redeemPointsSchema } from "../schemas/loyalty.schema";

const router = Router();

router.use(authenticate);

router.get("/balance", ctrl.getBalance);
router.post("/redeem", validate(redeemPointsSchema), ctrl.redeemPoints);
router.get("/history", ctrl.getHistory);

export default router;
