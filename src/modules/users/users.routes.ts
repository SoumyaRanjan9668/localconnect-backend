
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { getMyProfileController, updateMyProfileController, changeMyPasswordController, } from "./users.controller.js";

const router = Router();

// GET /api/users/profile
router.get("/profile", authenticate, getMyProfileController);

// PATCH /api/users/updateprofile
router.patch("/updateprofile", authenticate, updateMyProfileController);

// patch /api/users/changepassword
router.patch("/changepassword", authenticate, changeMyPasswordController);

export default router;
