
import { Router } from "express";

import {
  registerController,
  loginController,
  refreshController,
  logoutController,
} from "./auth.controller.js";

const router = Router();

// Registration
router.post("/register", registerController);

// Login
router.post("/login", loginController);

// Refresh Access Token
router.post("/refresh", refreshController);

// Logout
router.post("/logout", logoutController);

export default router;
