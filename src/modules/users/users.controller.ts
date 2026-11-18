
import type { Request, Response } from "express";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "./users.services.js";

export const getMyProfileController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const user = await getMyProfile(userId);

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "User not found"
    ) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unable to fetch profile",
    });
  }
};


export const updateMyProfileController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const updatedUser = await updateMyProfile(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};


export const changeMyPasswordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
      return;
    }

    if (typeof currentPassword !== "string" ||
        typeof newPassword !== "string") {
      res.status(400).json({
        success: false,
        message: "Passwords must be valid strings",
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
      return;
    }

    await changeMyPassword(
      userId,
      currentPassword,
      newPassword,
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });

  } catch (error) {
    const message =
      error instanceof Error ? error.message : "";

    if (message === "User not found") {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (
      message === "Current password is incorrect" ||
      message === "New password must be different"
    ) {
      res.status(400).json({
        success: false,
        message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unable to change password",
    });
  }
};
