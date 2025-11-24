import express from "express";
import cors, { CorsOptions } from "cors";
import { logger } from "./config/logger";
import marketsRouter from "./routes/markets";

export function createApp() {
  const app = express();

  const corsOptions: CorsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      name: "Convex Backend",
      status: "ok",
      endpoints: ["/health", "/api/markets"],
    });
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/markets", marketsRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}


