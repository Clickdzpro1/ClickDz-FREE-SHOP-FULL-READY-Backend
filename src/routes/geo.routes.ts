import { Router } from "express";
import * as ctrl from "../controllers/geo.controller";

const router = Router();

router.get("/wilayas", ctrl.getWilayas);
router.get("/wilayas/:id", ctrl.getWilayaById);
router.get("/wilayas/:wilayaId/communes", ctrl.getCommunesByWilaya);
router.get("/communes/search", ctrl.searchCommunes);

export default router;
