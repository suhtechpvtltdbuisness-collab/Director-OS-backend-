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

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "director-os-backend",
    origins: env.clientOrigins,
  });
});

app.use(requireDatabase);

app.use("/api/auth", authRoutes);
app.use("/api", modulesRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "SUH Director OS API", health: "/health" });
});

app.use(errorHandler);

export default app;
