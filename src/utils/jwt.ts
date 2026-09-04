import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { UserRole } from "../models/User";

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

function signToken(payload: TokenPayload, secret: Secret, expiresIn: string): string {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, secret, options);
}

export function signAccessToken(payload: TokenPayload): string {
  return signToken(payload, env.accessSecret, env.accessTtl);
}

export function signRefreshToken(payload: TokenPayload): string {
  return signToken(payload, env.refreshSecret, env.refreshTtl);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.refreshSecret) as TokenPayload;
}

export function signOtpToken(payload: { sub: string; email: string; role: UserRole; name: string }): string {
  return jwt.sign(payload, env.accessSecret, { expiresIn: `${env.otpTtlMinutes}m` });
}

export function verifyOtpToken(token: string): {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
} {
  return jwt.verify(token, env.accessSecret) as {
    sub: string;
    email: string;
    role: UserRole;
    name: string;
  };
}
