import app from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { ensureSeedUsers } from "./scripts/ensureUsers";

async function bootstrap(): Promise<void> {
  await connectDatabase(env.mongoUri);
  await ensureSeedUsers();
  app.listen(env.port, () => {
    console.log(`director-os-backend listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
