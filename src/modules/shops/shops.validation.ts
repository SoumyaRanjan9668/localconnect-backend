import { z } from "zod";

export const createShopSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Shop name must be at least 2 characters")
    .max(100, "Shop name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional(),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address cannot exceed 200 characters"),

  village: z
    .string()
    .trim()
    .min(2, "Village name must be at least 2 characters")
    .max(100, "Village name cannot exceed 100 characters"),

  imageUrl: z
    .url("Enter a valid image URL")
    .nullable()
    .optional(),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;