import { Router } from "express";
import * as ctrl from "../controllers/recommendation.controller";
import { authenticate, optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/also-bought/:productId", ctrl.getAlsoBought);
router.get("/similar/:productId", ctrl.getSimilar);
router.get("/personalized", authenticate, ctrl.getPersonalized);

export default router;
