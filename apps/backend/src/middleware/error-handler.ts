import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { logger } from "../config/logger.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err }, "Unexpected operational error");
    }
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  logger.error({ err }, "Unhandled error");
  return res.status(500).json({ success: false, message: "Internal server error" });
}

