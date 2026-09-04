import type { NextFunction, Request, Response } from "express";
import { connectDatabase } from "../config/db";
import { ensureSeedUsers } from "../scripts/ensureUsers";
import { AppError } from "./errorHandler";

let ready: Promise<void> | null = null;

export async function requireDatabase(
  _req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await connectDatabase();
    if (!ready) {
      ready = ensureSeedUsers().catch((error) => {
        ready = null;
        throw error;
      });
    }
    await ready;
    next();
  } catch (error) {
    console.error("Database connection failed", error);
    next(new AppError("Database unavailable. Check MONGODB_URI.", 503));
  }
}
