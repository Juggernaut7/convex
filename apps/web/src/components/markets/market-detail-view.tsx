"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock3, Share2, TrendingUp } from "lucide-react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import { MarketCard } from "@/components/markets/market-card";
import { StakeSheet } from "@/components/markets/stake-sheet";
import { MarketViewModel } from "@/types/market";
import { ClaimButton } from "@/components/markets/claim-button";
import { formatNumber } from "@/lib/number";
import { CONVEX_MANAGER_ADDRESS, convexManagerAbi } from "@/lib/contracts/convex-manager";

type MarketDetailViewProps = {
  market: MarketViewModel;
};

export function MarketDetailView({ market }: MarketDetailViewProps) {
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { writeContract, data: resolveHash, isPending: isResolving } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isResolved } = useWaitForTransactionReceipt({ hash: resolveHash });

  // Refresh page data after successful resolution
  useEffect(() => {
    if (isResolved) {
      router.refresh();
    }
  }, [isResolved, router]);

  // Check if the connected address is the resolver for this specific market
  const isMarketResolver = useMemo(() => {
    if (!isConnected || !address || !market.resolver) {
      return false;
    }
    return address.toLowerCase() === market.resolver.toLowerCase();
  }, [address, isConnected, market.resolver]);

  const handleResolve = (outcome: "yes" | "no") => {
    if (!market.onChainMarketId) return;
    const outcomeEnum = outcome === "yes" ? 1 : 2; // Outcome.Yes = 1, Outcome.No = 2
    writeContract({
      address: CONVEX_MANAGER_ADDRESS,
      abi: convexManagerAbi,
      functionName: "resolveMarket",
      args: [market.onChainMarketId, outcomeEnum],
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          asChild
          variant="outline"
          className="inline-flex items-center gap-2 rounded-full border-[#E5E7EB] bg-white text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6]"
        >
          <Link href="/markets">
            <ArrowLeft className="h-4 w-4" />
            Back to markets
          </Link>
        </Button>
        <Button
          variant="outline"
          className="inline-flex items-center gap-2 rounded-full border-[#E5E7EB] bg-white text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6]"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold text-[#217756]">
              {market.category}
            </div>
            <h1 className="text-3xl font-semibold text-[#0F172A] sm:text-4xl">{market.title}</h1>
            {market.description && (
              <p className="text-sm text-[#4B5563] sm:text-base">{market.description}</p>
            )}
          </div>

          <div className="grid gap-4 rounded-2xl bg-[#F9FAFB] p-5 sm:grid-cols-3">
            <div className="space-y-1 text-sm text-[#4B5563]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Close window</p>
              <p className="inline-flex items-center gap-2 text-base font-semibold text-[#111827]">
                <Clock3 className="h-4 w-4 text-[#35D07F]" />
                {market.closesIn}
              </p>
            </div>
            <div className="space-y-1 text-sm text-[#4B5563]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Pool size</p>
              <p className="inline-flex items-center gap-2 text-base font-semibold text-[#111827]">
                <TrendingUp className="h-4 w-4 text-[#35D07F]" />
                {formatNumber(market.totalPool, 2)} cUSD
              </p>
            </div>
            <div className="space-y-1 text-sm text-[#4B5563]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Creator fee</p>
              <p className="text-base font-semibold text-[#111827]">
                {market.creatorFeeBps ? `${(market.creatorFeeBps / 100).toFixed(2)}%` : "—"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">
              Market details
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#4B5563]">
              <li>Resolution type: {market.resolutionSource === "oracle" ? "Oracle" : "Manual"}</li>
              <li>Status: {market.status}</li>
              {market.winningOutcome && <li>Winning outcome: {market.winningOutcome.toUpperCase()}</li>}
              <li>Stake token: cUSD</li>
            </ul>
          </div>
        </div>

        <div className="space-y-5">
          <MarketCard
            market={market}
            onStake={(_, userChoice) => {
              setChoice(userChoice);
              setIsSheetOpen(true);
            }}
          />
          {isMarketResolver && (
            <>
              {market.status === "Resolved" || market.status === "Void" ? (
                <div className="rounded-3xl border-2 border-[#D1D5DB] bg-[#F9FAFB] p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280] mb-3">
                    Market Resolved
                  </h3>
                  <p className="text-sm text-[#4B5563] mb-2">
                    This market has been resolved.
                  </p>
                  {market.winningOutcome && (
                    <p className="text-sm font-semibold text-[#111827]">
                      Winning outcome: <span className="text-[#35D07F]">{market.winningOutcome.toUpperCase()}</span>
                    </p>
                  )}
                  {market.status === "Void" && (
                    <p className="text-sm font-semibold text-[#DC2626] mt-2">
                      Market was voided
                    </p>
                  )}
                </div>
              ) : market.resolverState.canResolve && market.status === "Live" ? (
                <div className="rounded-3xl border-2 border-[#35D07F] bg-[#E9F7EF] p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#217756] mb-3">
                    Resolver Controls
                  </h3>
                  <p className="text-xs text-[#6B7280] mb-4">
                    This market has ended. As the resolver, you can now resolve it to distribute the pool.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleResolve("yes")}
                      disabled={isResolving || isConfirming || market.status !== "Live"}
                      className="flex-1 rounded-xl bg-[#35D07F] text-sm font-semibold text-white hover:bg-[#29b46e] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isResolving || isConfirming ? "Resolving..." : "Resolve YES"}
                    </Button>
                    <Button
                      onClick={() => handleResolve("no")}
                      disabled={isResolving || isConfirming || market.status !== "Live"}
                      className="flex-1 rounded-xl bg-[#DC2626] text-sm font-semibold text-white hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isResolving || isConfirming ? "Resolving..." : "Resolve NO"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
          <ClaimButton market={market} />
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">
              Activity
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#4B5563]">
              <li>• Yes stake: {formatNumber(market.yesPool, 2)} cUSD ({market.yesOdds}%).</li>
              <li>• No stake: {formatNumber(market.noPool, 2)} cUSD ({market.noOdds}%).</li>
              <li>• Total pool: {formatNumber(market.totalPool, 2)} cUSD.</li>
            </ul>
          </div>
        </div>
      </section>

      <StakeSheet
        market={market}
        choice={choice}
        open={isSheetOpen && Boolean(choice)}
        onOpenChange={(open) => {
          if (!open) {
            setIsSheetOpen(false);
            setChoice(null);
          }
        }}
      />
    </>
  );
}


