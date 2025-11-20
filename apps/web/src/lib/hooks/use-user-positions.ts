"use client";

import { useAccount, useReadContracts } from "wagmi";
import { useMemo, useState, useEffect } from "react";
import { CONVEX_MANAGER_ADDRESS, convexManagerAbi } from "@/lib/contracts/convex-manager";
import { fetchMarketsClient } from "@/lib/api/markets";
import type { MarketViewModel } from "@/types/market";

export interface UserPosition {
  market: MarketViewModel;
  yesStake: bigint;
  noStake: bigint;
  totalStake: bigint;
  choice: "YES" | "NO" | null;
  potentialPayout: number;
  canClaim: boolean;
}

export function useUserPositions() {
  const { address, isConnected } = useAccount();
  const [markets, setMarkets] = useState<MarketViewModel[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);

  // Fetch all markets
  useEffect(() => {
    if (!isConnected) {
      setMarkets([]);
      setIsLoadingMarkets(false);
      return;
    }

    fetchMarketsClient()
      .then((data) => {
        setMarkets(data);
        setIsLoadingMarkets(false);
      })
      .catch((error) => {
        console.error("Error fetching markets:", error);
        setMarkets([]);
        setIsLoadingMarkets(false);
      });
  }, [isConnected]);

  // Fetch positions for all markets
  const positionContracts = useMemo(() => {
    if (!address || markets.length === 0) return [];
    return markets.map((market) => ({
      address: CONVEX_MANAGER_ADDRESS,
      abi: convexManagerAbi,
      functionName: "positionOf" as const,
      args: [BigInt(market.onChainMarketId || 0), address] as const,
    }));
  }, [address, markets]);

  const { data: positionsData, isLoading: isLoadingPositions } = useReadContracts({
    contracts: positionContracts,
    query: {
      enabled: positionContracts.length > 0 && isConnected,
    },
  });

  const userPositions = useMemo(() => {
    if (!isConnected || !address || !positionsData || markets.length === 0) {
      return [];
    }

    const positions: UserPosition[] = [];

    markets.forEach((market, index) => {
      const positionResult = positionsData[index];
      if (!positionResult?.data) return;

      const [yesStake, noStake] = positionResult.data as [bigint, bigint];
      const totalStake = yesStake + noStake;

      // Only include markets where user has a stake
      if (totalStake === 0n) return;

      const choice = yesStake > 0n ? "YES" : noStake > 0n ? "NO" : null;
      
      // Calculate potential payout
      let potentialPayout = 0;
      if (market.status === "Resolved" && market.winningOutcome) {
        const isWinner = (market.winningOutcome === "yes" && choice === "YES") || 
                        (market.winningOutcome === "no" && choice === "NO");
        if (isWinner && market.totalPool > 0) {
          const userStake = choice === "YES" ? Number(yesStake) : Number(noStake);
          const winningStake = market.winningOutcome === "yes" ? market.yesPool : market.noPool;
          potentialPayout = (userStake / winningStake) * market.totalPool;
        }
      } else if (market.status === "Live" && market.totalPool > 0) {
        // Estimate potential payout based on current odds
        const userStake = choice === "YES" ? Number(yesStake) : Number(noStake);
        const pool = choice === "YES" ? market.yesPool : market.noPool;
        if (pool > 0) {
          potentialPayout = (userStake / pool) * market.totalPool;
        }
      }

      const canClaim = (market.status === "Resolved" || market.status === "Void") && 
                      ((market.winningOutcome === "yes" && choice === "YES") ||
                       (market.winningOutcome === "no" && choice === "NO") ||
                       market.status === "Void");

      positions.push({
        market,
        yesStake,
        noStake,
        totalStake,
        choice,
        potentialPayout: potentialPayout / 1e18,
        canClaim: !!canClaim,
      });
    });

    return positions.sort((a, b) => {
      // Sort by: resolved/claimable first, then by total stake
      if (a.canClaim && !b.canClaim) return -1;
      if (!a.canClaim && b.canClaim) return 1;
      return Number(b.totalStake) - Number(a.totalStake);
    });
  }, [isConnected, address, positionsData, markets]);

  return {
    positions: userPositions,
    isLoading: isLoadingMarkets || isLoadingPositions,
  };
}

