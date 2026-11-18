import { prisma } from "../../config/database.js";
import type { CreateShopInput } from "./shops.validation.js";

export const createShop = async (
  ownerId: string,
  data: CreateShopInput,
) => {
  // Check if owner already has a shop
  const existingShop = await prisma.shop.findUnique({
    where: {
      ownerId,
    },
  });

  if (existingShop) {
    throw new Error("You already have a shop");
  }

  // Create shop
  const shop = await prisma.shop.create({
    data: {
      ownerId,
      name: data.name,
      description: data.description,
      phone: data.phone,
      address: data.address,
      village: data.village,
      imageUrl: data.imageUrl,
    },
  });

  return shop;
};