import dotenv from "dotenv";

try {
  dotenv.config();
} catch {
  // ignore missing .env in serverless
}

function required(name: string, fallback?: string): string {
  const raw = process.env[name];
  const value = (raw && raw.trim()) || fallback;
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name: string, fallback: string): string {
  const raw = process.env[name];
  return (raw && raw.trim()) || fallback;
}

function parseOrigins(): string[] {
  const fromList = process.env.CLIENT_ORIGINS ?? "";
  const single = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
  const defaults = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "https://director-os-ashen.vercel.app",
  ];
  return Array.from(
    new Set(
      [...defaults, single, ...fromList.split(",")]
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean),
    ),
  );
}

export const env = {
  port: Number(process.env.PORT ?? 5010),
  mongoUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/director-os"),
  mongoDbName: optional("MONGODB_DB_NAME", "director-os"),
  accessSecret: required("JWT_ACCESS_SECRET", "director-os-dev-access-secret"),
  refreshSecret: required("JWT_REFRESH_SECRET", "director-os-dev-refresh-secret"),
  accessTtl: optional("ACCESS_TOKEN_TTL", "7d"),
  refreshTtl: optional("REFRESH_TOKEN_TTL", "30d"),
  clientOrigins: parseOrigins(),
  directorEmail: optional("DIRECTOR_EMAIL", "director@suhtech.top").toLowerCase(),
  directorPassword: optional("DIRECTOR_PASSWORD", "director123"),
  directorName: optional("DIRECTOR_NAME", "Director"),
  managerEmail: optional("MANAGER_EMAIL", "manager@suhtech.top").toLowerCase(),
  managerPassword: optional("MANAGER_PASSWORD", "manager123"),
  managerName: optional("MANAGER_NAME", "Manager"),
  otpDemoMode: optional("OTP_DEMO_MODE", "true") === "true",
  otpDemoCode: optional("OTP_DEMO_CODE", "123456"),
  otpTtlMinutes: Number(optional("OTP_TTL_MINUTES", "10")),
};
