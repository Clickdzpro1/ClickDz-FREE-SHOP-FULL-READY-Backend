import { Router } from "express";
import * as ctrl from "../controllers/socialLogin.controller";
import { authenticate } from "../middleware";

const router = Router();

router.use(authenticate);

router.get("/accounts", ctrl.getLinkedAccounts);
router.delete("/accounts/:provider", ctrl.unlinkAccount);

export default router;
