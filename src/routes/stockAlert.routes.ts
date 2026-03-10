import { Router } from "express";
import * as ctrl from "../controllers/stockAlert.controller";
import { authenticate, validate } from "../middleware";
import { stockAlertSchema } from "../schemas/bulk.schema";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.getMyAlerts);
router.post("/subscribe", validate(stockAlertSchema), ctrl.subscribe);
router.post("/unsubscribe", validate(stockAlertSchema), ctrl.unsubscribe);

export default router;
