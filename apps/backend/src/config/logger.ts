import pino from "pino";
import pinoHttp from "pino-http";

const isProd = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          singleLine: false,
          messageFormat: "{msg}",
          ignore: "pid,hostname",
          errorLikeObjectKeys: ["err"]
        }
      }
});

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) {
      return "error";
    }
    if (res.statusCode >= 400) {
      return "warn";
    }
    return "info";
  },
  customSuccessMessage: (_req, res) => `${res.statusCode} ${res.statusMessage ?? ""}`.trim()
});

