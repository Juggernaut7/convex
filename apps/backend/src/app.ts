import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { httpLogger } from "./config/logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { routes } from "./routes/index.js";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: "*", credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(httpLogger);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api", routes);

  app.use(errorHandler);

  return app;
}

