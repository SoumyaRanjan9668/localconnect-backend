
import { prisma } from "../../config/database.js";

export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      address: true,
      village: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
