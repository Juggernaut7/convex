import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase } from "./db/connection.js";
import { getOracleRunner } from "./services/market-oracle.runner.js";

async function bootstrap() {
  await connectDatabase();
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 API ready on http://localhost:${env.PORT}`);
  });

  const runner = getOracleRunner();
  runner.start();

  process.on("SIGINT", async () => {
    logger.info("Received SIGINT, shutting down...");
    runner.stop();
    server.close();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "Failed to bootstrap server");
  process.exit(1);
});

