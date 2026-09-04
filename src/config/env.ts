import dotenv from "dotenv";

try {
  dotenv.config();
} catch {
  // ignore missing .env in serverless
}

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
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
  mongoDbName: process.env.MONGODB_DB_NAME ?? "director-os",
  accessSecret: required("JWT_ACCESS_SECRET", "director-os-dev-access-secret"),
  refreshSecret: required("JWT_REFRESH_SECRET", "director-os-dev-refresh-secret"),
  accessTtl: process.env.ACCESS_TOKEN_TTL ?? "7d",
  refreshTtl: process.env.REFRESH_TOKEN_TTL ?? "30d",
  clientOrigins: parseOrigins(),
  directorEmail: (process.env.DIRECTOR_EMAIL ?? "director@suhtech.top").toLowerCase(),
  directorPassword: process.env.DIRECTOR_PASSWORD ?? "director123",
  directorName: process.env.DIRECTOR_NAME ?? "Director",
  managerEmail: (process.env.MANAGER_EMAIL ?? "manager@suhtech.top").toLowerCase(),
  managerPassword: process.env.MANAGER_PASSWORD ?? "manager123",
  managerName: process.env.MANAGER_NAME ?? "Manager",
  otpDemoMode: (process.env.OTP_DEMO_MODE ?? "true") === "true",
  otpDemoCode: process.env.OTP_DEMO_CODE ?? "123456",
  otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES ?? 10),
};
