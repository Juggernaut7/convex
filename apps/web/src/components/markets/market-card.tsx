"use client";

import Link from "next/link";
import { Clock3, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarketViewModel } from "@/types/market";
import { formatNumber } from "@/lib/number";

type MarketCardProps = {
  market: MarketViewModel;
  onStake?: (market: MarketViewModel, choice: "yes" | "no") => void;
  compact?: boolean;
};

export function MarketCard({ market, onStake, compact = false }: MarketCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 transition hover:border-[#35D07F]/60 hover:shadow-md">
      <div className="space-y-3">
        <Link href={`/market/${market.id}`} className="block">
          <p className="text-base font-semibold text-[#0F172A] sm:text-lg">{market.title}</p>
        </Link>
        {!compact && market.description && (
          <p className="text-sm text-[#4B5563]">{market.description}</p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4B5563]">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4 text-[#35D07F]" />
            Closes in {market.closesIn}
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            <TrendingUp className="h-4 w-4 text-[#35D07F]" />
            {formatNumber(market.totalPool)} cUSD pool
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-[#35D07F] transition-all"
            style={{ width: `${market.yesOdds}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#4B5563]">
          <span>Yes {market.yesOdds}%</span>
          <span>No {market.noOdds}%</span>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
        <Button
          className="rounded-2xl bg-[#35D07F] text-sm font-semibold text-white hover:bg-[#29b46e]"
          onClick={() => onStake?.(market, "yes")}
        >
          Yes · {market.yesMultiplier.toFixed(1)}x
        </Button>
        <Button
          variant="outline"
          className="rounded-2xl border border-[#E5E7EB] bg-white text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6]"
          onClick={() => onStake?.(market, "no")}
        >
          No · {market.noMultiplier.toFixed(1)}x
        </Button>
      </div>
    </article>
  );
}
