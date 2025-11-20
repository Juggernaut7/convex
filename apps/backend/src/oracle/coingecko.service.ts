import axios from "axios";
import { env } from "../config/env";
import { logger } from "../config/logger";

export interface CoingeckoPriceResult {
  source: "coingecko";
  asset: string;
  price: number;
}

const cache = new Map<string, { value: CoingeckoPriceResult; expiresAt: number }>();

export async function getCoingeckoPrice(asset: string): Promise<CoingeckoPriceResult> {
  const cacheKey = asset.toLowerCase();
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const url = env.coingeckoApiUrl;
  const id = mapAssetToCoingeckoId(asset);

  const { data } = await axios.get(url, {
    params: {
      ids: id,
      vs_currencies: "usd",
    },
  });

  const price = data?.[id]?.usd;
  if (typeof price !== "number") {
    logger.warn({ asset, id, data }, "Unexpected CoinGecko response");
    throw new Error(`Missing price for asset ${asset}`);
  }

  const result: CoingeckoPriceResult = {
    source: "coingecko",
    asset,
    price,
  };

  cache.set(cacheKey, {
    value: result,
    expiresAt: now + env.oracleCacheTtlSeconds * 1000,
  });

  return result;
}

function mapAssetToCoingeckoId(asset: string): string {
  switch (asset.toLowerCase()) {
    case "eth":
    case "ethereum":
      return "ethereum";
    case "btc":
    case "bitcoin":
      return "bitcoin";
    case "celo":
      return "celo";
    default:
      return asset.toLowerCase();
  }
}


