import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import { createShopController } from "./shops.controllers.js";
import { createShopSchema } from "./shops.validation.js";

const router = Router();

// Create shop
router.post(
  "/",
  authenticate,
  authorize("SHOP_OWNER"),
  validate(createShopSchema),
  createShopController,
);

export default router;