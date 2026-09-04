import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { requireDatabase } from "./middleware/requireDatabase";
import authRoutes from "./routes/auth.routes";
import modulesRoutes from "./routes/modules.routes";

const app = express();

app.use(
  helmet({
    // Browser clients call this API from another origin (Vercel frontend).
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;
  if (env.clientOrigins.includes(origin)) return true;
  // Preview + production Vercel frontends
  try {
    const host = new URL(origin).hostname;
    if (host === "director-os-ashen.vercel.app") return true;
    if (host.endsWith(".vercel.app") && host.includes("director-os")) return true;
  } catch {
    return false;
  }
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  }),
);

// Never hit Mongo on CORS preflight
app.options("*", cors());

app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  const uri = env.mongoUri || "";
  const looksLocal = /127\.0\.0\.1|localhost/.test(uri);
  res.json({
    ok: true,
    service: "director-os-backend",
    origins: env.clientOrigins,
    mongoConfigured: Boolean(uri) && !looksLocal,
    mongoTarget: looksLocal ? "local" : uri.includes("mongodb+srv") ? "atlas" : "other",
  });
});

app.get("/", (_req, res) => {
  res.json({ message: "SUH Director OS API", health: "/health" });
});

app.use(requireDatabase);

app.use("/api/auth", authRoutes);
app.use("/api", modulesRoutes);

app.use(errorHandler);

export default app;
