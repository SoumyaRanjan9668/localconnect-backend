
import type { Request, Response } from "express";
import { getMyProfile } from "./users.services.js";

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
