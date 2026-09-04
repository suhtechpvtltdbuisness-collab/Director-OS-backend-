import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { User, type UserRole } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import type { AuthRequest } from "../middleware/authenticate";
import { comparePassword, hashPassword } from "../utils/hash";
import {
  signAccessToken,
  signOtpToken,
  signRefreshToken,
  verifyOtpToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { toPublicUser } from "../utils/user";

const loginSchema = z.object({
  email: z.string().trim().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["director", "manager"]).optional(),
});

const verifySchema = z.object({
  otpToken: z.string().min(1),
  otp: z.string().trim().min(4).max(8),
});

function issueTokens(user: {
  _id: { toString(): string };
  email: string;
  role: UserRole;
  name: string;
}) {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

function generateOtp(): string {
  if (env.otpDemoMode) return env.otpDemoCode;
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);
    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user) throw new AppError("Invalid email or password", 401);

    const valid = await comparePassword(body.password, user.passwordHash);
    if (!valid) throw new AppError("Invalid email or password", 401);

    if (body.role && body.role !== user.role) {
      throw new AppError(`This account is registered as ${user.role}`, 403);
    }

    // Admin account (director@suhtech.top) skips 2FA OTP
    if (user.email === env.directorEmail) {
      user.otpHash = null;
      user.otpExpiresAt = null;
      await user.save();
      const tokens = issueTokens(user);
      res.json({
        message: "Signed in",
        skipOtp: true,
        user: toPublicUser(user),
        ...tokens,
      });
      return;
    }

    const otp = generateOtp();
    user.otpHash = await hashPassword(otp);
    user.otpExpiresAt = new Date(Date.now() + env.otpTtlMinutes * 60 * 1000);
    await user.save();

    const otpToken = signOtpToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      message: "OTP sent to your work email",
      skipOtp: false,
      otpToken,
      email: user.email,
      role: user.role,
      ...(env.otpDemoMode ? { demoOtp: otp } : {}),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0]?.message ?? "Invalid input", 400));
      return;
    }
    next(error);
  }
}

export async function verifyOtp(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = verifySchema.parse(req.body);
    let payload;
    try {
      payload = verifyOtpToken(body.otpToken);
    } catch {
      throw new AppError("OTP session expired. Sign in again.", 401);
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      throw new AppError("OTP session invalid. Sign in again.", 401);
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      throw new AppError("OTP expired. Sign in again.", 401);
    }

    const demoOk = env.otpDemoMode && body.otp === env.otpDemoCode;
    const hashOk = await comparePassword(body.otp, user.otpHash);
    if (!demoOk && !hashOk) throw new AppError("Invalid verification code", 401);

    user.otpHash = null;
    user.otpExpiresAt = null;
    await user.save();

    const tokens = issueTokens(user);
    res.json({
      message: "Signed in",
      user: toPublicUser(user),
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0]?.message ?? "Invalid input", 400));
      return;
    }
    next(error);
  }
}

export async function me(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);
    const user = await User.findById(req.user.sub);
    if (!user) throw new AppError("User not found", 404);
    res.json({ user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = z.string().min(1).parse(req.body.refreshToken);
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }
    const user = await User.findById(payload.sub);
    if (!user) throw new AppError("User not found", 404);
    res.json({
      user: toPublicUser(user),
      ...issueTokens(user),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError("Refresh token required", 400));
      return;
    }
    next(error);
  }
}

export async function logout(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json({ message: "Signed out" });
}
