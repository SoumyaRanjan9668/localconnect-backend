
import type { Request, Response, NextFunction } from "express";

type Role =
  | "CUSTOMER"
  | "SHOP_OWNER"
  | "DELIVERY_PARTNER"
  | "ADMIN";

export const authorize = (...allowedRoles: Role[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    // Check authentication
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // Check user role
    if (!allowedRoles.includes(req.user.role as Role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
      return;
    }

    next();
  };
};
