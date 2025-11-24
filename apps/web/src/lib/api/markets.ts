import { getAllMarkets, getMarket } from "@/lib/contracts/server";
import { MarketViewModel, OutcomeSide } from "@/types/market";
import { MarketType, MarketStatus, Outcome } from "@/lib/contracts/convex-manager";
import { API_BASE_URL } from "@/lib/constants";

function mapMarketStatus(status: MarketStatus): "Live" | "Closed" | "Resolved" | "Void" {
  switch (status) {
    case MarketStatus.Live:
      return "Live";
    case MarketStatus.Resolving:
      return "Closed";
    case MarketStatus.Resolved:
      return "Resolved";
    case MarketStatus.Void:
      return "Void";
    default:
      return "Live";
  }
}

function mapOutcome(outcome: Outcome): OutcomeSide | undefined {
  switch (outcome) {
    case Outcome.Yes:
      return "yes";
    case Outcome.No:
      return "no";
    default:
      return undefined;
  }
}

async function transformMarket(
  market: Awaited<ReturnType<typeof getMarket>>,
  metadata?: { title: string; description?: string; category: string } | null
): Promise<MarketViewModel | null> {
  if (!market) return null;

  const totalPool = market.yesPool + market.noPool;
  // Fix odds calculation: handle empty pools correctly
  const yesOdds = totalPool > 0n ? Number((market.yesPool * 10000n) / totalPool) / 100 : 50;
  const noOdds = totalPool > 0n ? Number((market.noPool * 10000n) / totalPool) / 100 : 50;

  return {
    id: market.marketId.toString(),
    onChainMarketId: market.marketId,
    title: metadata?.title || `Market #${market.marketId}`,
    description: metadata?.description || "",
    category: (metadata?.category as "Sports" | "Crypto" | "Culture") || (market.marketType === MarketType.Sports ? "Sports" : "Crypto"),
    closeTime: new Date(market.closeTime * 1000).toISOString(),
    resolveTime: market.resolveTime > 0 ? new Date(market.resolveTime * 1000).toISOString() : undefined,
    closesIn: market.closeTime > Date.now() / 1000 ? `${Math.floor((market.closeTime - Date.now() / 1000) / 3600)}h` : "Closed",
    totalPool: Number(totalPool) / 1e18,
    yesPool: Number(market.yesPool) / 1e18,
    noPool: Number(market.noPool) / 1e18,
    yesOdds,
    noOdds,
    yesMultiplier: yesOdds > 0 ? 100 / yesOdds : 0,
    noMultiplier: noOdds > 0 ? 100 / noOdds : 0,
    protocolFeeBps: market.protocolFeeBps,
    creatorFeeBps: market.creatorFeeBps,
    status: mapMarketStatus(market.status),
    winningOutcome: mapOutcome(market.winningOutcome),
    usesOracle: market.marketType === MarketType.Price,
    resolutionSource: market.marketType === MarketType.Price ? "oracle" : "manual",
    creator: market.creator,
    resolver: market.resolver,
    metadataURI: "",
    thresholdValue: null,
    updatedAt: new Date().toISOString(),
    createdAt: new Date(market.closeTime * 1000 - 86400000).toISOString(),
    canStake: market.status === MarketStatus.Live && market.closeTime > Date.now() / 1000,
    resolverState: {
      source: market.marketType === MarketType.Price ? "oracle" : "manual",
      closeTimeReached: market.closeTime <= Date.now() / 1000,
      readyToResolve: market.status === MarketStatus.Live && market.closeTime <= Date.now() / 1000,
      canResolve: market.status === MarketStatus.Live && market.closeTime <= Date.now() / 1000,
    },
  };
}

async function fetchMarketMetadata(onChainId: number): Promise<{ title: string; description?: string; category: string } | null> {
  if (!API_BASE_URL) {
    console.warn(`[fetchMarketMetadata] API_BASE_URL not configured, skipping metadata for market ${onChainId}`);
    return null;
  }

  try {
    // Add timeout for Render cold starts (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_BASE_URL}/api/markets/metadata/${onChainId}`, {
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Market metadata not found - this is expected for markets created before metadata system
        // Silently return null - no need to log expected 404s
        return null;
      }
      console.warn(`[fetchMarketMetadata] API returned ${response.status} for market ${onChainId}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`[fetchMarketMetadata] Successfully fetched metadata for market ${onChainId}`);
    return {
      title: data.title,
      description: data.description,
      category: data.category,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(`[fetchMarketMetadata] Request timeout for market ${onChainId} (API may be cold starting)`);
    } else {
      console.error(`[fetchMarketMetadata] Error fetching metadata for market ${onChainId}:`, error);
    }
    return null;
  }
}

export async function fetchMarkets(): Promise<MarketViewModel[]> {
  const markets = await getAllMarkets();
  const marketsWithMetadata = await Promise.all(
    markets.map(async (market) => {
      if (!market) return null;
      const metadata = await fetchMarketMetadata(market.marketId);
      return await transformMarket(market, metadata);
    })
  );
  return marketsWithMetadata.filter((m): m is MarketViewModel => m !== null);
}

export async function fetchMarketById(id: string): Promise<MarketViewModel | null> {
  const marketId = parseInt(id, 10);
  if (isNaN(marketId)) return null;
  const market = await getMarket(marketId);
  if (!market) return null;
  const metadata = await fetchMarketMetadata(marketId);
  return transformMarket(market, metadata);
}

export async function fetchMarketsClient(): Promise<MarketViewModel[]> {
  return fetchMarkets();
}

export type CreateMarketRequest = {
  title: string;
  description?: string;
  category: "sports" | "crypto" | "culture" | "custom";
  marketType: "price" | "event";
  closeTime: string;
  resolutionSource: "manual" | "oracle";
  thresholdValue?: number;
  eventReference?: string;
};

export async function createMarket(_body: CreateMarketRequest): Promise<MarketViewModel> {
  throw new Error("Market creation must be done on-chain via wallet. Use the create market form.");
}

export async function resolveMarketRequest(marketId: string, outcome: OutcomeSide): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL not configured");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/markets/${marketId}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ outcome }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Resolution failed" }));
      throw new Error(error.message || "Resolution failed");
    }
  } catch (error) {
    console.error(`[resolveMarketRequest] Error resolving market ${marketId}:`, error);
    throw error;
  }
}
