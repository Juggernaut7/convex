import { createPublicClient, http, type Address } from "viem";
import { celo } from "viem/chains";
import { CONVEX_MANAGER_ADDRESS, convexManagerAbi, MarketType, MarketStatus, Outcome } from "./convex-manager";
import { RPC_URL, DEFAULT_CHAIN_ID } from "@/lib/constants";

const celoSepolia = {
  ...celo,
  id: DEFAULT_CHAIN_ID,
  network: "celo-sepolia",
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
  },
};

const publicClient = createPublicClient({
  chain: celoSepolia,
  transport: http(),
});

export async function getMarketCount(): Promise<number> {
  const count = await publicClient.readContract({
    address: CONVEX_MANAGER_ADDRESS,
    abi: convexManagerAbi,
    functionName: "nextMarketId",
  });
  return Number(count);
}

export async function getMarket(marketId: number) {
  try {
    const data = await publicClient.readContract({
      address: CONVEX_MANAGER_ADDRESS,
      abi: convexManagerAbi,
      functionName: "markets",
      args: [marketId],
    });

    if (!data) {
      console.log(`[getMarket] Market ${marketId} returned null data`);
      return null;
    }

  const [
    marketType,
    status,
    winningOutcome,
    creator,
    resolver,
    closeTime,
    resolveTime,
    protocolFeeBps,
    creatorFeeBps,
    yesPool,
    noPool,
    payoutPool,
    totalWinningStake,
    metadataHash,
  ] = data;

    return {
      marketId,
      marketType: Number(marketType) as MarketType,
      status: Number(status) as MarketStatus,
      winningOutcome: Number(winningOutcome) as Outcome,
      creator: creator as Address,
      resolver: resolver as Address,
      closeTime: Number(closeTime),
      resolveTime: Number(resolveTime),
      protocolFeeBps: Number(protocolFeeBps),
      creatorFeeBps: Number(creatorFeeBps),
      yesPool: BigInt(yesPool),
      noPool: BigInt(noPool),
      payoutPool: BigInt(payoutPool),
      totalWinningStake: BigInt(totalWinningStake),
      metadataHash: metadataHash as `0x${string}`,
    };
  } catch (error) {
    console.error(`[getMarket] Error fetching market ${marketId}:`, error);
    return null;
  }
}

export async function getAllMarkets(): Promise<Awaited<ReturnType<typeof getMarket>>[]> {
  try {
    const count = await getMarketCount();
    console.log(`[getAllMarkets] Found ${count} markets (nextMarketId)`);
    
    if (count === 0) return [];

    const markets = await Promise.all(
      Array.from({ length: count }, (_, i) => {
        console.log(`[getAllMarkets] Fetching market ${i}`);
        return getMarket(i);
      })
    );

    const validMarkets = markets.filter((m): m is NonNullable<typeof m> => m !== null);
    console.log(`[getAllMarkets] Returning ${validMarkets.length} valid markets`);
    return validMarkets;
  } catch (error) {
    console.error("[getAllMarkets] Error:", error);
    return [];
  }
}

