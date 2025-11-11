"use client";

"use client";

import { useMemo, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Loader2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { MarketViewModel } from "@/types/market";
import { stakeOnMarket, toTokenValue } from "@/lib/contracts/manager";
import { formatNumber } from "@/lib/number";

type StakeSheetProps = {
  market: MarketViewModel | null;
  choice: "yes" | "no" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StakeSheet({ market, choice, open, onOpenChange }: StakeSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [stakeValue, setStakeValue] = useState("5");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { openConnectModal } = useConnectModal();

  const multiplier = useMemo(() => {
    if (!market || !choice) return 0;
    return choice === "yes" ? market.yesMultiplier : market.noMultiplier;
  }, [choice, market]);

  const potentialReward = useMemo(() => {
    if (!stakeValue) return null;
    return (Number(stakeValue) * multiplier).toFixed(2);
  }, [multiplier, stakeValue]);

  const handleConfirm = async () => {
    if (!market || !choice) return;
    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }
    if (!publicClient || !walletClient) {
      setErrorMessage("Wallet not ready. Please try again.");
      return;
    }
    if (!market.onChainMarketId) {
      setErrorMessage("This market is not yet live on-chain.");
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      const amount = toTokenValue(stakeValue);
      await stakeOnMarket(walletClient, publicClient, market.onChainMarketId, choice, amount);
      onOpenChange(false);
    } catch (error) {
      console.error("Stake failed", error);
      setErrorMessage((error as Error).message ?? "Failed to stake");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={
          isDesktop
            ? "h-full w-full max-w-md border-l border-[#E5E7EB] bg-white p-6"
            : "rounded-t-3xl border-t border-[#E5E7EB] bg-white p-6"
        }
      >
        {market && choice && (
          <>
            <SheetHeader className="text-left">
              <SheetTitle className="text-xl font-semibold text-[#0F172A]">
                Confirm your prediction
              </SheetTitle>
              <SheetDescription className="mt-1 text-sm text-[#4B5563]">
                {market.title}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-5">
              <div className="rounded-2xl bg-[#F3F4F6] p-4 text-xs text-[#4B5563]">
                <p className="flex items-center justify-between text-sm font-semibold text-[#111827]">
                  <span>Current pool</span>
                  <span>{formatNumber(market.totalPool, 2)} cUSD</span>
                </p>
                <p className="mt-2 flex items-center justify-between">
                  <span>Yes side</span>
                  <span>
                    {formatNumber(market.yesPool, 2)} cUSD ({market.yesOdds}%)
                  </span>
                </p>
                <p className="flex items-center justify-between">
                  <span>No side</span>
                  <span>
                    {formatNumber(market.noPool, 2)} cUSD ({market.noOdds}%)
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm text-[#4B5563]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#111827]">You picked</span>
                  <span className="rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold uppercase text-[#217756]">
                    {choice.toUpperCase()}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span>Multiplier</span>
                  <span className="font-semibold text-[#111827]">{multiplier.toFixed(1)}x</span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-[#4B5563]">
                <label className="text-sm font-medium text-[#111827]" htmlFor="stake-input">
                  Stake amount
                </label>
                <div className="flex items-center rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
                  <input
                    id="stake-input"
                    type="number"
                    min={1}
                    step={1}
                    value={stakeValue}
                    onChange={(event) => setStakeValue(event.target.value)}
                    className="w-full bg-transparent text-base font-semibold text-[#111827] outline-none ring-0"
                    placeholder="5"
                  />
                  <span className="text-sm font-semibold text-[#6B7280]">cUSD</span>
                </div>
                <div className="flex gap-2">
                  {[1, 5, 10].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setStakeValue(String(amount))}
                      className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
                        Number(stakeValue) === amount
                          ? "bg-[#35D07F] text-white"
                          : "bg-[#F3F4F6] text-[#4B5563]"
                      }`}
                    >
                      {amount} cUSD
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-[#F3F4F6] p-4 text-sm text-[#4B5563]">
                <div className="flex items-center justify-between">
                  <span>Estimated reward</span>
                  <span className="text-base font-semibold text-[#111827]">
                    {potentialReward ? `${potentialReward} cUSD` : "--"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#6B7280]">
                  Rewards unlock instantly after resolution—claim from your wallet with one tap.
                </p>
              </div>

              {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

              <Button
                disabled={isProcessing || !market?.canStake || !choice || !market.onChainMarketId}
                onClick={handleConfirm}
                className="w-full rounded-2xl bg-[#35D07F] text-base font-semibold text-white hover:bg-[#29b46e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirming...
                  </span>
                ) : (
                  "Confirm with wallet"
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
