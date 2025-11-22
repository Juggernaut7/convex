"use client";

import { useReadContract, useReadContracts, useWatchContractEvent } from "wagmi";
import { CONVEX_MANAGER_ADDRESS, convexManagerAbi, MarketType, MarketStatus, Outcome } from "@/lib/contracts/convex-manager";
import type { Address } from "viem";
import { useMemo } from "react";

export function useMarketCount() {
  return useReadContract({
    address: CONVEX_MANAGER_ADDRESS,
    abi: convexManagerAbi,
    functionName: "nextMarketId",
  });
}

export function useMarket(marketId: number | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: CONVEX_MANAGER_ADDRESS,
    abi: convexManagerAbi,
    functionName: "markets",
    args: marketId !== undefined ? [marketId] : undefined,
    query: {
      enabled: marketId !== undefined,
    },
  });

  return useMemo(() => {
    if (!data) return { market: null, isLoading, error };
    
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
      market: {
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
      },
      isLoading,
      error,
    };
  }, [data, isLoading, error, marketId]);
}

export function useMarkets(count: number) {
  const contracts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        address: CONVEX_MANAGER_ADDRESS,
        abi: convexManagerAbi,
        functionName: "markets" as const,
        args: [BigInt(i)] as const,
      })),
    [count]
  );

  const { data, isLoading, error } = useReadContracts({
    contracts,
    query: {
      enabled: count > 0,
    },
  });

  return useMemo(() => {
    if (!data) return { markets: [], isLoading, error };

    const markets = data
      .map((result, index) => {
        if (!result.result) return null;
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
        ] = result.result;

        return {
          marketId: index,
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
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);

    return { markets, isLoading, error };
  }, [data, isLoading, error]);
}

export function usePosition(marketId: number | undefined, account: Address | undefined) {
  return useReadContract({
    address: CONVEX_MANAGER_ADDRESS,
    abi: convexManagerAbi,
    functionName: "positionOf",
    args: marketId !== undefined && account ? [marketId, account] : undefined,
    query: {
      enabled: marketId !== undefined && account !== undefined,
    },
  });
}

