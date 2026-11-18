import type { Request, Response } from "express";
import { createShop } from "./shops.services.js";

export const createShopController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const ownerId = req.user?.userId;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const shop = await createShop(ownerId, req.body);

    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: shop,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "You already have a shop"
    ) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unable to create shop",
    });
  }
};