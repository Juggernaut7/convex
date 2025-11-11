"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Clock3, Share2, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarketCard } from "@/components/markets/market-card";
import { StakeSheet } from "@/components/markets/stake-sheet";
import { MarketViewModel } from "@/types/market";
import { ClaimButton } from "@/components/markets/claim-button";
import { formatNumber } from "@/lib/number";

type MarketDetailViewProps = {
  market: MarketViewModel;
};

export function MarketDetailView({ market }: MarketDetailViewProps) {
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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


