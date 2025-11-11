import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import {
  listPendingOracleMarkets,
  markMarketErrored,
  markMarketResolved,
  type PendingMarket
} from "./market-oracle.store.js";
import { fetchCoinGeckoPrice, logOracleSnapshot } from "./oracle.service.js";

const MARKET_MANAGER_ABI = [
  "event MarketCreated(uint32 indexed marketId, bytes32 indexed questionId, address indexed creator, address resolver, uint64 closeTime, bool usesOracle, uint16 protocolFeeBps, uint16 creatorFeeBps, string metadataURI)",
  "event MarketResolved(uint32 indexed marketId, uint8 outcome, uint128 payoutPool, uint128 totalWinningStake)",
  "function resolveMarket(uint32 marketId, uint8 outcome) external"
];

const YES_OUTCOME = 1;
const NO_OUTCOME = 2;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface OracleContext {
  provider: JsonRpcProvider;
  wallet: Wallet;
  contract: Contract;
}

export class MarketOracleRunner {
  private intervalHandle?: NodeJS.Timeout;
  private processing = false;
  private context: OracleContext;

  constructor() {
    if (env.ALLOW_SELF_SIGNED_CERTS) {
      logger.warn(
        "ALLOW_SELF_SIGNED_CERTS is enabled. TLS certificate verification is disabled for outbound RPC calls."
      );
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const provider = new JsonRpcProvider(env.RPC_URL);
    const wallet = new Wallet(env.RESOLVER_PRIVATE_KEY, provider);
    const contract = new Contract(env.MANAGER_CONTRACT_ADDRESS, MARKET_MANAGER_ABI, wallet);

    this.context = { provider, wallet, contract };
  }

  async manualResolve(marketId: number, outcome: "yes" | "no") {
    const outcomeValue = outcome === "yes" ? YES_OUTCOME : NO_OUTCOME;
    const receipt = await this.resolveWithRetry(marketId, outcomeValue);
    return receipt;
  }

  start() {
    if (this.intervalHandle) {
      return;
    }

    logger.info("Starting oracle runner");
    this.context.contract.on("MarketCreated", (marketId, questionId) => {
      logger.info(
        {
          marketId: Number(marketId),
          questionId
        },
        "Observed on-chain MarketCreated event"
      );
    });

    this.intervalHandle = setInterval(() => void this.tick(), env.ORACLE_POLL_INTERVAL_MS);
    void this.tick();
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = undefined;
    }

    this.context.contract.removeAllListeners();
    logger.info("Stopped oracle runner");
  }

  private async tick() {
    if (this.processing) {
      return;
    }
    this.processing = true;

    try {
      const pending = await listPendingOracleMarkets();
      if (!pending.length) {
        logger.debug("No pending oracle markets found");
        return;
      }

      logger.debug({ count: pending.length }, "Processing pending oracle markets");

      for (const market of pending) {
        await this.handleMarket(market);
      }
    } catch (error) {
      logger.error({ err: error }, "Oracle tick failed");
    } finally {
      this.processing = false;
    }
  }

  private async handleMarket(market: PendingMarket) {
    const now = Date.now();
    if (market.closeTime.getTime() > now) {
      logger.debug(
        {
          marketId: market.onChainMarketId,
          closeTime: market.closeTime
        },
        "Market close time not reached yet"
      );
      return;
    }

    if (market.marketType === "price") {
      await this.handlePriceMarket(market);
      return;
    }

    logger.warn(
      {
        marketId: market.onChainMarketId,
        marketType: market.marketType
      },
      "Unsupported market type for oracle automation"
    );
  }

  private async handlePriceMarket(market: PendingMarket) {
    try {
      const [providerKey, assetId] = (market.oracleId ?? "").split(":");
      if (providerKey !== "coingecko" || !assetId) {
        throw new Error(`Unsupported or missing oracleId (${market.oracleId ?? "undefined"})`);
      }

      const price = await fetchCoinGeckoPrice(assetId);
      logOracleSnapshot(price, `market-${market.onChainMarketId}`);

      const threshold = market.thresholdValue ?? env.DEFAULT_MARKET_THRESHOLD;
      const outcome = price.value >= threshold ? YES_OUTCOME : NO_OUTCOME;

      const receipt = await this.resolveWithRetry(market.onChainMarketId, outcome);
      await markMarketResolved(market.id, outcome === YES_OUTCOME ? "yes" : "no", receipt.transactionHash, {
        price: price.value,
        threshold,
        fetchedAt: price.fetchedAt
      });

      logger.info(
        {
          marketId: market.onChainMarketId,
          price: price.value,
          threshold,
          outcome,
          txHash: receipt.transactionHash
        },
        "Resolved price market via oracle"
      );
    } catch (error) {
      logger.error(
        {
          err: error,
          marketId: market.onChainMarketId
        },
        "Failed to resolve price market"
      );
      await markMarketErrored(market.id, (error as Error).message);
    }
  }

  private async resolveWithRetry(marketId: number, outcome: number) {
    let attempt = 0;
    for (;;) {
      attempt += 1;
      try {
        const tx = await this.context.contract.resolveMarket(marketId, outcome, {
          gasLimit: 400_000
        });
        logger.info({ txHash: tx.hash, marketId, attempt }, "Submitted resolve transaction");
        const receipt = await tx.wait();
        return receipt;
      } catch (error) {
        logger.error({ err: error, marketId, attempt }, "Resolve transaction failed");
        if (attempt >= env.ORACLE_MAX_RETRIES) {
          throw error;
        }
        await delay(2_000 * attempt);
      }
    }
  }
}

let runnerInstance: MarketOracleRunner | null = null;

export function getOracleRunner() {
  if (!runnerInstance) {
    runnerInstance = new MarketOracleRunner();
  }
  return runnerInstance;
}

export async function resolveMarketManually(marketId: number, outcome: "yes" | "no") {
  const runner = getOracleRunner();
  return runner.manualResolve(marketId, outcome);
}

