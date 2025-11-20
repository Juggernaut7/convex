import axios from "axios";
import { env } from "../config/env";
import { logger } from "../config/logger";

export interface SportsResult {
  source: "sports-api";
  value: number | string | boolean;
  raw: unknown;
}

const cache = new Map<string, { value: SportsResult; expiresAt: number }>();

export async function getSportsData(
  asset: string,
  kind: "sports" | "event"
): Promise<SportsResult> {
  const cacheKey = `${kind}:${asset}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const url = env.sportsApiUrl;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (env.sportsApiKey) {
    headers["Authorization"] = `Bearer ${env.sportsApiKey}`;
  }

  logger.debug({ url, asset, kind }, "Fetching data from sports API");

  const { data } = await axios.get(url, {
    headers,
    params: {
      asset,
      kind,
    },
  });

  const value =
    typeof data?.value === "number" ||
    typeof data?.value === "string" ||
    typeof data?.value === "boolean"
      ? (data.value as number | string | boolean)
      : null;

  if (value === null) {
    logger.warn({ asset, kind, data }, "Unexpected sports API response");
    throw new Error("Invalid sports API response");
  }

  const result: SportsResult = {
    source: "sports-api",
    value,
    raw: data,
  };

  cache.set(cacheKey, {
    value: result,
    expiresAt: now + env.oracleCacheTtlSeconds * 1000,
  });

  return result;
}


