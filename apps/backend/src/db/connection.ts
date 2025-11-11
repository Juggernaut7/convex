import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectDatabase(attempt = 1): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info("🟢 Connected to MongoDB");
  } catch (error) {
    logger.error({ err: error, attempt }, `Failed to connect to MongoDB (attempt ${attempt}/${MAX_RETRIES})`);

    if (attempt >= MAX_RETRIES) {
      logger.error("Exceeded maximum MongoDB connection retries, exiting.");
      process.exit(1);
    }

    const nextAttempt = attempt + 1;
    logger.warn(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s (attempt ${nextAttempt}/${MAX_RETRIES}).`);
    await delay(RETRY_DELAY_MS);
    await connectDatabase(nextAttempt);
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info("🔴 Disconnected from MongoDB");
}

