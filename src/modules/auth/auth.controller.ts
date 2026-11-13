
import type { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
} from "./auth.services.js";

export const registerController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      name,
      phone,
      email,
      password,
      role,
      address,
      village,
    } = req.body;

    // Required field validation
    if (!name || !phone || !password) {
      res.status(400).json({
        success: false,
        message: "Name, phone and password are required",
      });
      return;
    }
    // Allow only public registration roles
    const allowedRoles = [
    "CUSTOMER",
    "SHOP_OWNER",
    "DELIVERY_PARTNER",
    ];

    if (role && !allowedRoles.includes(role)) {
    res.status(400).json({
        success: false,
        message: "Invalid registration role",
    });
    return;
    }
    // Call registration service
    const user = await registerUser({
      name,
      phone,
      email,
      password,
      role,
      address,
      village,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: user,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    const statusCode =
      message === "Phone number already registered" ||
      message === "Email already registered"
        ? 409
        : 500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

// Login Controller
export const loginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { identifier, password, role } = req.body;

    // Required field validation
    if (!identifier || !password || !role) {
      res.status(400).json({
        success: false,
        message: "Phone/email, password and role are required",
      });
      return;
    }

    // Validate role
    const allowedRoles = [
      "CUSTOMER",
      "SHOP_OWNER",
      "DELIVERY_PARTNER",
    ];

    if (!allowedRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: "Invalid account role",
      });
      return;
    }

    // Call login service
    const result = await loginUser({
      identifier: identifier.trim(),
      password,
      role,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    const statusCode =
      message === "Invalid credentials" ? 401 : 500;

    res.status(statusCode).json({
      success: false,
      message:
        statusCode === 401
          ? "Invalid phone/email or password"
          : "Login failed. Please try again later.",
    });
  }
};



// Refresh Token Controller
export const refreshController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (
      typeof refreshToken !== "string" ||
      !refreshToken.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
      return;
    }

    const result = await refreshUserToken(refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "";

    if (message === "Invalid refresh token") {
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unable to refresh token",
    });
  }
};

// Logout Controller
export const logoutController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (
      typeof refreshToken !== "string" ||
      !refreshToken.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
      return;
    }

    await logoutUser(refreshToken);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Logout failed. Please try again later.",
    });
  }
};

