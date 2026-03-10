import { Router } from "express";
import * as ctrl from "../controllers/auditLog.controller";
import { authenticate, adminGuard } from "../middleware";

const router = Router();

router.use(authenticate, adminGuard);

router.get("/", ctrl.listAuditLogs);
router.get("/:entity/:entityId", ctrl.getEntityLogs);

export default router;
