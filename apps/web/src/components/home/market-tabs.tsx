"use client";

import { useMemo, useState } from "react";
import { Clock3, Search, SlidersHorizontal, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MarketViewModel } from "@/types/market";
import { StakeSheet } from "@/components/markets/stake-sheet";
import { formatNumber } from "@/lib/number";

type Category = "Sports" | "Crypto" | "Culture";

type Selection = {
  market: MarketViewModel;
  choice: "yes" | "no";
};

type MarketTabsProps = {
  markets: MarketViewModel[];
};

export function MarketTabs({ markets }: MarketTabsProps) {
  const categories: Category[] = ["Sports", "Crypto", "Culture"];
  const [activeCategory, setActiveCategory] = useState<Category>("Sports");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMarkets = useMemo(() => {
    const filtered = markets.filter(
      (market) =>
        market.category === activeCategory &&
        market.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort markets: Live first, then Closed/Resolved/Void at the bottom
    return filtered.sort((a, b) => {
      const statusOrder: Record<string, number> = { Live: 0, Closed: 1, Resolved: 2, Void: 3 };
      return (statusOrder[a.status] ?? 999) - (statusOrder[b.status] ?? 999);
    });
  }, [activeCategory, markets, searchTerm]);

  const handleSelect = (market: MarketViewModel, choice: "yes" | "no") => {
    if (!market.canStake) return;
    setSelection({ market, choice });
  };

  return (
    <>
      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#111827] sm:text-xl">Explore markets</h2>
            <p className="mt-1 hidden text-xs font-medium uppercase tracking-wide text-[#6B7280] sm:block">
              Updated in real-time
            </p>
          </div>
          <span className="text-xs font-medium text-[#6B7280] sm:hidden">Live</span>
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-3">
              <Search className="h-4 w-4 text-[#6B7280]" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-10 border-0 bg-transparent px-0 text-sm focus:ring-0 focus-visible:ring-0"
                placeholder="Search markets"
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-2xl border-[#E5E7EB] bg-white text-sm font-semibold text-[#4B5563] hover:bg-[#F3F4F6] sm:w-auto"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#35D07F]" />
              Filters
            </Button>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            {categories.map((category) => (
              <button
                key={category}
                className={cn(
                  "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-none",
                  category === activeCategory
                    ? "bg-[#35D07F] text-white shadow-sm"
                    : "bg-[#F3F4F6] text-[#4B5563]"
                )}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredMarkets.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-[#D1D5DB] bg-white/60 p-6 text-center text-sm text-[#6B7280]">
              No live markets in this category yet. Check back soon or create one.
            </div>
          ) : (
            filteredMarkets.map((market) => (
              <article
                key={market.id}
                className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 transition hover:border-[#35D07F]/60 hover:shadow-sm"
              >
              <div className="flex h-full flex-col space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#111827] sm:text-base">{market.title}</p>
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

                <div className="mt-auto grid grid-cols-2 gap-3">
                  <Button
                    className="rounded-2xl bg-[#35D07F] text-sm font-semibold text-white hover:bg-[#29b46e]"
                    onClick={() => handleSelect(market, "yes")}
                      disabled={!market.canStake}
                  >
                    Yes · {market.yesMultiplier.toFixed(1)}x
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl border border-[#E5E7EB] bg-white text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6]"
                    onClick={() => handleSelect(market, "no")}
                      disabled={!market.canStake}
                  >
                    No · {market.noMultiplier.toFixed(1)}x
                  </Button>
                </div>
              </div>
            </article>
            ))
          )}
        </div>
      </section>

      <StakeSheet
        market={selection?.market ?? null}
        choice={selection?.choice ?? null}
        open={Boolean(selection)}
        onOpenChange={(open) => {
          if (!open) {
            setSelection(null);
          }
        }}
      />
    </>
  );
}


