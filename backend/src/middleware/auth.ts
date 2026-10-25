import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../types";

export function requireAuth(jwtSecret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = header.slice("Bearer ".length);
    try {
      const payload = jwt.verify(token, jwtSecret) as AuthUser;
      req.user = {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      };
      return next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  return next();
}
