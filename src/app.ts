
import express from "express";
import type { Request, Response } from "express";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/users.routes.js";

const app = express();

// Middleware
app.use(express.json());


// Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "LocalConnect API is running",
    status: "healthy",
  });
});
// Authentication Routes
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

export default app;
