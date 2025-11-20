import { ethers } from "ethers";
import { env } from "../config/env";
import { logger } from "../config/logger";

const MANAGER_ABI = [
  "function resolveMarket(uint32 marketId, uint8 outcome) external",
  "function finalizeFromResolver(uint32 marketId, uint8 outcome, bytes resolverContext) external",
];

export type OutcomeSide = "yes" | "no";

export async function resolveOnChain(
  onChainId: number,
  outcome: OutcomeSide
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(env.rpcUrl, {
    name: "celo",
    chainId: env.chainId,
  });

  const wallet = new ethers.Wallet(env.resolverPrivateKey, provider);
  const manager = new ethers.Contract(env.managerAddress, MANAGER_ABI, wallet);

  const outcomeEnum = outcome === "yes" ? 1 : 2; // Outcome.Yes / Outcome.No

  logger.info(
    { onChainId, outcome, outcomeEnum },
    "Submitting on-chain resolution"
  );

  // Use resolveMarket which accepts RESOLVER_ROLE or market.resolver
  const tx = await manager.resolveMarket(onChainId, outcomeEnum);
  logger.info({ hash: tx.hash }, "Resolution tx sent");

  const receipt = await tx.wait();
  logger.info(
    { hash: tx.hash, status: receipt?.status },
    "Resolution tx confirmed"
  );

  return tx.hash;
}


