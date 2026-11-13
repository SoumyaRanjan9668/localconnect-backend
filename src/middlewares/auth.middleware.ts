
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Authenticated user information
export interface AuthUser {
  userId: string;
  role: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Verify Access Token
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
      return;
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
      return;
    }

    // Get JWT secret
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: "Authentication configuration error",
      });
      return;
    }

    // Verify JWT
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string" ||
      typeof decoded.role !== "string"
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
      return;
    }

    // Attach authenticated user to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    // Continue to controller
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};
