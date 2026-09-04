import type { NextFunction, Request, Response } from "express";
import { connectDatabase } from "../config/db";
import { env } from "../config/env";
import { ensureSeedUsers } from "../scripts/ensureUsers";
import { AppError } from "./errorHandler";

let ready: Promise<void> | null = null;

export async function requireDatabase(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (req.method === "OPTIONS") {
    next();
    return;
  }

  try {
    const uri = env.mongoUri || "";
    const onVercel = Boolean(process.env.VERCEL);
    if (onVercel && (!uri || /127\.0\.0\.1|localhost/.test(uri))) {
      throw new AppError(
        "MONGODB_URI is missing or still points to localhost. Set an Atlas mongodb+srv:// URI in the Vercel project Environment Variables (Production), then Redeploy.",
        503,
      );
    }

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
    if (error instanceof AppError) {
      next(error);
      return;
    }
    const detail =
      error instanceof Error ? error.message : "Unknown database error";
    next(
      new AppError(
        `Database unavailable: ${detail}. On Atlas → Network Access, allow IP 0.0.0.0/0, then Redeploy.`,
        503,
      ),
    );
  }
}
