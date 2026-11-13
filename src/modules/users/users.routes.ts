
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { getMyProfileController } from "./users.controller.js";

const router = Router();

// GET /api/users/profile
router.get("/profile", authenticate, getMyProfileController);

export default router;
