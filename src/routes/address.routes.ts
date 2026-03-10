import { Router } from "express";
import * as ctrl from "../controllers/address.controller";
import { authenticate, validate } from "../middleware";
import { createAddressSchema, updateAddressSchema } from "../schemas/address.schema";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.listAddresses);
router.get("/:id", ctrl.getAddress);
router.post("/", validate(createAddressSchema), ctrl.createAddress);
router.put("/:id", validate(updateAddressSchema), ctrl.updateAddress);
router.delete("/:id", ctrl.deleteAddress);
router.patch("/:id/default", ctrl.setDefaultAddress);

export default router;
