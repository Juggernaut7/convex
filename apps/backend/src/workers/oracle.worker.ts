#!/usr/bin/env tsx
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { fetchCoinGeckoPrice, logOracleSnapshot } from "../services/oracle.service.js";

const managerAbi = ["function resolveMarket(uint32 marketId, uint8 outcome) external"];

async function main() {
  if (env.ALLOW_SELF_SIGNED_CERTS) {
    logger.warn("ALLOW_SELF_SIGNED_CERTS is enabled. TLS certificate verification is disabled for outbound RPC calls.");
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  const provider = new JsonRpcProvider(env.RPC_URL);
  const wallet = new Wallet(env.RESOLVER_PRIVATE_KEY, provider);
  const manager = new Contract(env.MANAGER_CONTRACT_ADDRESS, managerAbi, wallet);

  const marketId = Number(process.argv[2]);
  const threshold = Number(process.argv[3] ?? env.DEFAULT_MARKET_THRESHOLD);
  const assetId = process.argv[4] ?? "ethereum";

  if (Number.isNaN(marketId)) {
    logger.error("Usage: pnpm --filter convex-backend tsx src/workers/oracle.worker.ts <marketId> [threshold] [assetId]");
    process.exit(1);
  }

  const price = await fetchCoinGeckoPrice(assetId);
  logOracleSnapshot(price, `market-${marketId}`);

  const outcome = price.value >= threshold ? 1 : 2; // 1 => YES, 2 => NO (match Outcome enum in contract)
  logger.info({ marketId, price: price.value, threshold, outcome }, "Resolving market");

  const tx = await manager.resolveMarket(marketId, outcome, { gasLimit: 400_000 });
  logger.info({ txHash: tx.hash }, "Sent resolve transaction");
  const receipt = await tx.wait();
  logger.info({ txHash: receipt.transactionHash }, "Market resolved");
}

main().catch((error) => {
  logger.error({ err: error }, "Oracle worker failed");
  process.exit(1);
});

