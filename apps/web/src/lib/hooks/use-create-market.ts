"use client";

import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { CONVEX_MANAGER_ADDRESS, convexManagerAbi, MarketType } from "@/lib/contracts/convex-manager";
import { RESOLVER_ADDRESS, API_BASE_URL } from "@/lib/constants";
import { keccak256, toHex, decodeEventLog } from "viem";

export function useCreateMarket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const publicClient = usePublicClient();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const createMarket = async (params: {
    question: string;
    category: "Sports" | "Crypto" | "Culture";
    closeTime: number;
    entryAmount: number;
    resolutionSource: "manual" | "oracle";
  }) => {
    const marketType = params.category === "Crypto" ? MarketType.Price : MarketType.Sports;
    const metadataHash = keccak256(toHex(params.question));
    
    // extraData is no longer needed since we removed price/sports config
    const extraData = "0x" as `0x${string}`;

    // Resolver address - should be set via env or use default
    const resolverAddress = RESOLVER_ADDRESS;

    writeContract({
      address: CONVEX_MANAGER_ADDRESS,
      abi: convexManagerAbi,
      functionName: "createMarket",
      args: [
        {
          marketType,
          closeTime: BigInt(params.closeTime),
          resolver: resolverAddress as `0x${string}`,
          protocolFeeBps: 200,
          creatorFeeBps: 100,
          metadataHash,
          extraData,
        },
      ],
    });
  };

  // Store metadata after transaction confirms
  const storeMetadata = async (params: {
    question: string;
    category: "Sports" | "Crypto" | "Culture";
    resolutionSource: "manual" | "oracle";
    marketId: number;
  }) => {
    if (!API_BASE_URL) {
      console.warn("API_BASE_URL not configured, skipping metadata storage");
      return;
    }

    try {
      const marketType = params.category === "Crypto" ? "crypto" : params.category === "Sports" ? "sports" : "event";
      const resolutionSource = params.resolutionSource === "oracle" ? "coingecko" : "flare";

      console.log(`[storeMetadata] Storing metadata for market ${params.marketId} via ${API_BASE_URL}/api/markets/metadata`);
      
      const response = await fetch(`${API_BASE_URL}/api/markets/metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onChainId: params.marketId,
          title: params.question,
          description: "",
          category: params.category,
          marketType,
          resolutionSource,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText || "Unknown error" };
        }
        console.error(`[storeMetadata] API returned ${response.status}:`, error);
        throw new Error(`Failed to store metadata: ${error.error || response.statusText}`);
      }

      const result = await response.json();
      console.log(`[storeMetadata] Success:`, result);
    } catch (error) {
      console.error("Error storing market metadata:", error);
    }
  };

  // Extract market ID from transaction receipt
  const marketId = receipt ? (() => {
    try {
      console.log(`[useCreateMarket] Searching ${receipt.logs.length} logs for MarketCreated event`);
      
      const marketCreatedEvent = receipt.logs.find((log) => {
        try {
          const decoded = decodeEventLog({
            abi: convexManagerAbi,
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === "MarketCreated";
        } catch {
          return false;
        }
      });

      if (marketCreatedEvent) {
        const decoded = decodeEventLog({
          abi: convexManagerAbi,
          data: marketCreatedEvent.data,
          topics: marketCreatedEvent.topics,
        });
        const id = Number((decoded.args as any).marketId);
        console.log(`[useCreateMarket] ✅ Extracted market ID: ${id}`);
        return id;
      } else {
        console.warn(`[useCreateMarket] ⚠️ MarketCreated event not found in receipt logs`);
        // Fallback: try to get nextMarketId from contract (but this requires a contract call)
      }
    } catch (error) {
      console.error("[useCreateMarket] Error extracting market ID:", error);
    }
    return null;
  })() : null;

  return {
    createMarket,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    marketId,
    storeMetadata,
  };
}

