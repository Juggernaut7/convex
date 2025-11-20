import { MarketViewModel } from "@/types/market";

/**
 * Calculate trending markets based on a sophisticated algorithm:
 * - Only Live markets (explicitly excludes Closed, Resolved, Void)
 * - Markets with actual stakes (totalPool > 0)
 * - Considers pool size, time until close, and activity
 * - Prioritizes markets closing soon (higher urgency = more trending)
 * - Sorted by trending score (combination of factors)
 */
export function getTrendingMarkets(
  markets: MarketViewModel[],
  limit: number = 4
): MarketViewModel[] {
  const now = Date.now() / 1000;
  
  return markets
    .filter((market) => {
      // Explicitly exclude closed/ended markets - only Live markets
      const isLive = market.status === "Live";
      const hasStakes = market.totalPool > 0;
      const isNotEnded = market.status !== "Closed" && 
                        market.status !== "Resolved" && 
                        market.status !== "Void";
      
      return isLive && isNotEnded && hasStakes;
    })
    .map((market) => {
      // Calculate trending score
      const closeTime = new Date(market.closeTime).getTime() / 1000;
      const hoursUntilClose = Math.max(0, (closeTime - now) / 3600);
      
      // Base score: pool size (normalized)
      const poolScore = market.totalPool;
      
      // Urgency score: markets closing soon get a boost (inverse of hours until close)
      // Markets closing in next 24h get maximum boost, scaling down to 0 at 7 days
      const urgencyMultiplier = hoursUntilClose <= 24 
        ? 1.5  // High urgency boost
        : hoursUntilClose <= 48
        ? 1.2  // Medium urgency boost
        : hoursUntilClose <= 168  // 7 days
        ? 1.0 + (168 - hoursUntilClose) / 168 * 0.3  // Gradual boost
        : 1.0;  // No boost for markets closing far in future
      
      // Activity score: consider odds movement (more balanced = more activity)
      // Markets with closer to 50/50 odds might indicate more active trading
      const balanceScore = 1 - Math.abs(0.5 - market.yesOdds / 100) * 2; // 0 to 1, higher = more balanced
      const activityMultiplier = 1 + balanceScore * 0.2; // Up to 20% boost for balanced markets
      
      // Combined trending score
      const trendingScore = poolScore * urgencyMultiplier * activityMultiplier;
      
      return {
        market,
        trendingScore,
      };
    })
    .sort((a, b) => {
      // Sort by trending score (highest first)
      return b.trendingScore - a.trendingScore;
    })
    .slice(0, limit)
    .map((item) => item.market);
}

/**
 * Get featured markets (top markets by volume)
 * Only includes Live markets (excludes closed/ended markets)
 */
export function getFeaturedMarkets(
  markets: MarketViewModel[],
  limit: number = 3
): MarketViewModel[] {
  return markets
    .filter((market) => {
      // Only include Live markets with stakes (exclude closed/ended)
      const isLive = market.status === "Live";
      const hasStakes = market.totalPool > 0;
      const isNotEnded = market.status !== "Closed" && 
                        market.status !== "Resolved" && 
                        market.status !== "Void";
      
      return isLive && isNotEnded && hasStakes;
    })
    .sort((a, b) => {
      // Sort by total pool (highest first)
      return b.totalPool - a.totalPool;
    })
    .slice(0, limit);
}

