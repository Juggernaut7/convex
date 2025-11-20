import { env } from "../config/env";
import { logger } from "../config/logger";
import {
  findPendingMarkets,
  markMarketResolved,
} from "../markets/market.service";
import {
  getCoingeckoPrice,
  getSportsData,
  evaluate,
  resolveOnChain,
} from "../oracle";

export function startScheduler() {
  const intervalMs = env.oraclePollIntervalMs;

  logger.info({ intervalMs }, "Starting oracle resolution scheduler");

  setInterval(async () => {
    try {
      const pending = await findPendingMarkets();
      if (!pending.length) {
        return;
      }

      logger.info({ count: pending.length }, "Found pending markets to resolve");

      for (const market of pending) {
        try {
          const value =
            market.resolutionSource === "coingecko"
              ? (await getCoingeckoPrice(market.asset)).price
              : (
                  await getSportsData(
                    market.asset,
                    market.marketType === "sports" ? "sports" : "event"
                  )
                ).value;

          const { outcome } = evaluate({
            marketType: market.marketType,
            condition: market.condition,
            fetchedValue: value,
          });

          await resolveOnChain(market.onChainId, outcome);
          await markMarketResolved(market._id.toString(), outcome);

          logger.info(
            { marketId: market._id.toString(), onChainId: market.onChainId, outcome },
            "Market resolved successfully"
          );
        } catch (error) {
          logger.error(
            { error, marketId: market._id.toString(), onChainId: market.onChainId },
            "Failed to resolve market"
          );
        }
      }
    } catch (error) {
      logger.error({ error }, "Scheduler tick failed");
    }
  }, intervalMs);
}


