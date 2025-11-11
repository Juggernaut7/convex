"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import { Button } from "@/components/ui/button";
import { MarketViewModel } from "@/types/market";
import { MANAGER_CONTRACT_ADDRESS } from "@/lib/constants";
import { convexManagerAbi } from "@/lib/contracts/manager";

type ClaimButtonProps = {
  market: MarketViewModel;
  className?: string;
  onClaimed?: () => void;
};

export function ClaimButton({ market, className, onClaimed }: ClaimButtonProps) {
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { openConnectModal } = useConnectModal();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [position, setPosition] = useState<{ yesStake: bigint; noStake: bigint } | null>(null);

  const canClaim =
    market.status === "Resolved" || market.status === "Void" ? market.onChainMarketId !== undefined : false;

  useEffect(() => {
    let cancelled = false;
    const fetchPosition = async () => {
      if (!address || !publicClient || !market.onChainMarketId) {
        setPosition(null);
        return;
      }
      try {
        const response = (await publicClient.readContract({
          address: MANAGER_CONTRACT_ADDRESS,
          abi: convexManagerAbi,
          functionName: "positionOf",
          args: [BigInt(market.onChainMarketId), address],
        })) as [bigint, bigint];
        if (!cancelled) {
          setPosition({ yesStake: response[0], noStake: response[1] });
        }
      } catch (error) {
        console.error("Failed to fetch position", error);
      }
    };
    void fetchPosition();
    return () => {
      cancelled = true;
    };
  }, [address, publicClient, market.onChainMarketId, market.status]);

  const hasClaimable = useMemo(() => {
    if (!position) return false;
    if (market.status === "Void") {
      return position.yesStake > 0n || position.noStake > 0n;
    }
    if (market.status === "Resolved" && market.winningOutcome) {
      return market.winningOutcome === "yes" ? position.yesStake > 0n : position.noStake > 0n;
    }
    return false;
  }, [position, market.status, market.winningOutcome]);

  const handleClaim = async () => {
    if (!market.onChainMarketId) return;
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (!walletClient || !publicClient) {
      setErrorMessage("Wallet not ready. Try again.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const hash = await walletClient.writeContract({
        address: MANAGER_CONTRACT_ADDRESS,
        abi: convexManagerAbi,
        functionName: "claim",
        args: [BigInt(market.onChainMarketId)],
        chain: walletClient.chain ?? publicClient.chain,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      onClaimed?.();
    } catch (error) {
      console.error("Claim failed", error);
      setErrorMessage((error as Error).message ?? "Claim failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!canClaim) {
    return null;
  }

  return (
    <div className={className}>
      <Button
        disabled={!hasClaimable || isLoading}
        onClick={handleClaim}
        className="w-full rounded-2xl bg-[#35D07F] text-sm font-semibold text-white hover:bg-[#29b46e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Claiming...
          </span>
        ) : (
          "Claim winnings"
        )}
      </Button>
      {errorMessage && <p className="mt-2 text-sm text-red-500">{errorMessage}</p>}
    </div>
  );
}

