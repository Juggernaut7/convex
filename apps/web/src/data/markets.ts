import type { Market, MarketCategory } from "@/types/market";

export const MARKET_CATEGORIES: MarketCategory[] = ["Sports", "Crypto", "Culture"];

export const SAMPLE_MARKETS: Market[] = [
  {
    id: "nigeria-match",
    category: "Sports",
    question: "Will Nigeria win tonight?",
    closesIn: "2h 14m",
    pool: 1240,
    odds: { yes: 62, no: 38 },
    multiplier: { yes: 1.8, no: 2.3 },
    description: "International friendly match — Nigeria vs. Ghana.",
  },
  {
    id: "eth-price",
    category: "Crypto",
    question: "Will ETH close above $4k today?",
    closesIn: "5h 02m",
    pool: 1560,
    odds: { yes: 54, no: 46 },
    multiplier: { yes: 2.1, no: 1.9 },
    description: "Track Ethereum price action before midnight UTC.",
  },
  {
    id: "afrofuture",
    category: "Culture",
    question: "Will AfroFuture stream hit 250k views?",
    closesIn: "8h 30m",
    pool: 920,
    odds: { yes: 44, no: 56 },
    multiplier: { yes: 2.4, no: 1.7 },
    description: "Concert stream attendance threshold before 11pm WAT.",
  },
  {
    id: "premier-league",
    category: "Sports",
    question: "Will Salah score first this weekend?",
    closesIn: "1d 6h",
    pool: 780,
    odds: { yes: 48, no: 52 },
    multiplier: { yes: 2.0, no: 2.0 },
    description: "Premier League fixture — first goal scorer prediction.",
  },
  {
    id: "btc-weekly",
    category: "Crypto",
    question: "Will BTC close the week above $72k?",
    closesIn: "3d 2h",
    pool: 2100,
    odds: { yes: 57, no: 43 },
    multiplier: { yes: 1.9, no: 2.2 },
    description: "Weekly close benchmark for Bitcoin, settlement Sunday 23:00 UTC.",
  },
  {
    id: "afcon-qualifier",
    category: "Sports",
    question: "Will Ghana qualify for AFCON tonight?",
    closesIn: "6h 15m",
    pool: 980,
    odds: { yes: 61, no: 39 },
    multiplier: { yes: 1.8, no: 2.4 },
  },
  {
    id: "culture-drop",
    category: "Culture",
    question: "Will the new Afrobeats single top Boomplay charts?",
    closesIn: "2d 4h",
    pool: 640,
    odds: { yes: 58, no: 42 },
    multiplier: { yes: 1.9, no: 2.1 },
  },
];

export function getMarketById(id: string): Market | undefined {
  return SAMPLE_MARKETS.find((market) => market.id === id);
}

export function getMarketsByCategory(category: MarketCategory | "All"): Market[] {
  if (category === "All") {
    return SAMPLE_MARKETS;
  }
  return SAMPLE_MARKETS.filter((market) => market.category === category);
}


