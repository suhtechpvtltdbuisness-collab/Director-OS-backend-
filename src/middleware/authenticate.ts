import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler";
import { verifyAccessToken, type TokenPayload } from "../utils/jwt";
import type { UserRole } from "../models/User";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }
    req.user = verifyAccessToken(header.slice(7));
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required", 401));
      return;
    }
    if (!roles.includes(req.user.role as UserRole)) {
      next(new AppError("Forbidden — director access required", 403));
      return;
    }
    next();
  };
}
