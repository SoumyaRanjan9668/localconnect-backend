
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in .env file");
}

const adapter = new PrismaPg({
  connectionString,
});

export const prisma = new PrismaClient({
  adapter,
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log("Database disconnected.");
};
