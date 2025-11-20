import mongoose from "mongoose";
import { createApp } from "./app";
import { env, validateEnv } from "./config/env";
import { logger } from "./config/logger";
import { startScheduler } from "./jobs/scheduler";

async function connectMongoWithRetry(maxAttempts = 5) {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;
    try {
      logger.info(
        { mongoUri: env.mongoUri, attempt },
        "Connecting to MongoDB (attempt)"
      );
      await mongoose.connect(env.mongoUri);
      logger.info(
        { mongoUri: env.mongoUri },
        "Successfully connected to MongoDB"
      );
      return;
    } catch (error) {
      logger.error(
        {
          attempt,
          message:
            error instanceof Error
              ? error.message
              : "Unknown MongoDB connection error",
        },
        "MongoDB connection failed. If this is Atlas, check that your IP is whitelisted."
      );
      if (attempt >= maxAttempts) {
        throw error;
      }
      const delayMs = 1000 * attempt;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function main() {
  validateEnv();

  await connectMongoWithRetry(5);

  const app = createApp();

  app.listen(env.port, () => {
    logger.info(
      { port: env.port, url: `http://localhost:${env.port}` },
      "Backend server listening"
    );
  });

  startScheduler();
}

main().catch((error) => {
  logger.error({ error }, "Fatal error during startup");
  process.exit(1);
});



