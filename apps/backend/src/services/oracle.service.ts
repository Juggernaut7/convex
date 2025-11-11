import axios from "axios";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export interface PriceFeedResult {
  source: string;
  assetId: string;
  value: number;
  fetchedAt: number;
  raw: unknown;
}

export async function fetchCoinGeckoPrice(assetId: string, currency = "usd"): Promise<PriceFeedResult> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${assetId}&vs_currencies=${currency}`;
  const headers = env.COINGECKO_API_KEY ? { "x-cg-pro-api-key": env.COINGECKO_API_KEY } : undefined;
  const response = await axios.get(url, { headers, timeout: 8_000 });
  const value = response.data?.[assetId]?.[currency];
  if (typeof value !== "number") {
    throw new Error("Unexpected CoinGecko response");
  }
  return {
    source: "coingecko",
    assetId,
    value,
    fetchedAt: Date.now(),
    raw: response.data
  };
}

export interface SportsEventResult {
  source: string;
  eventId: string;
  winner: "yes" | "no" | "draw";
  fetchedAt: number;
  raw: unknown;
}

export async function fetchSportsResult(eventId: string): Promise<SportsEventResult> {
  if (!env.SPORTS_API_KEY) {
    throw new Error("SPORTS_API_KEY not configured");
  }

  // Example using API-FOOTBALL (RapidAPI)
  const url = `https://v3.football.api-sports.io/fixtures?id=${eventId}`;
  const response = await axios.get(url, {
    headers: {
      "x-apisports-key": env.SPORTS_API_KEY
    },
    timeout: 10_000
  });

  const fixture = response.data?.response?.[0];
  if (!fixture) {
    throw new Error("Fixture not found");
  }

  const homeGoals = fixture.goals?.home;
  const awayGoals = fixture.goals?.away;
  let winner: "yes" | "no" | "draw" = "draw";
  if (homeGoals > awayGoals) {
    winner = "yes";
  } else if (awayGoals > homeGoals) {
    winner = "no";
  }

  return {
    source: "api-football",
    eventId,
    winner,
    fetchedAt: Date.now(),
    raw: response.data
  };
}

export function median(values: number[]): number {
  if (values.length === 0) {
    throw new Error("Cannot compute median of empty array");
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function logOracleSnapshot(snapshot: unknown, label: string) {
  logger.info({ snapshot }, `oracle-snapshot:${label}`);
}

