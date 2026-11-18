
import { prisma } from "../../config/database.js";
import bcrypt from "bcryptjs";

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

export const updateMyProfile = async (
  userId: string,
  data: {
    name?: string;
    email?: string;
    address?: string;
    village?: string;
  },
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      address: true,
      village: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};


export const changeMyPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!isPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  // Prevent same password
  const isSamePassword = await bcrypt.compare(
    newPassword,
    user.password,
  );

  if (isSamePassword) {
    throw new Error("New password must be different");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    12,
  );

  // Update password and revoke refresh token
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    },
  });

  return true;
};
