"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { Market, MarketCategory } from "@/types/market";

import { MarketCard } from "./market-card";
import { MarketFilterBar } from "./market-filter-bar";

type MarketExplorerProps = {
  markets: Market[];
  categories: MarketCategory[];
  defaultCategory?: MarketCategory | "All";
  enableFiltersButton?: boolean;
  emptyStateMessage?: string;
};

type Selection = {
  market: Market;
  choice: "yes" | "no";
};

export function MarketExplorer({
  markets,
  categories,
  defaultCategory = "All",
  enableFiltersButton = true,
  emptyStateMessage = "No markets found for this category yet. Check back soon!",
}: MarketExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<MarketCategory | "All">(defaultCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [stakeValue, setStakeValue] = useState<string>("5");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const filteredMarkets = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return markets.filter((market) => {
      const matchesCategory = activeCategory === "All" || market.category === activeCategory;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        market.question.toLowerCase().includes(normalizedSearch) ||
        (market.description?.toLowerCase().includes(normalizedSearch) ?? false);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, markets, searchTerm]);

  const handleSelect = (market: Market, choice: "yes" | "no") => {
    setSelection({ market, choice });
    setStakeValue("5");
    setIsSheetOpen(true);
  };

  const potentialReward =
    selection && stakeValue
      ? (Number(stakeValue) * selection.market.multiplier[selection.choice]).toFixed(2)
      : null;

  return (
    <>
      <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#111827] sm:text-xl">Explore markets</h2>
              <p className="mt-1 hidden text-xs font-medium uppercase tracking-wide text-[#6B7280] sm:block">
                Updated in real-time
              </p>
            </div>
            <span className="text-xs font-medium text-[#6B7280] sm:hidden">Live</span>
          </div>

          <MarketFilterBar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onSearchChange={setSearchTerm}
            showFiltersButton={enableFiltersButton}
          />

          {filteredMarkets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-10 text-center text-sm text-[#6B7280]">
              {emptyStateMessage}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredMarkets.map((market) => (
                <MarketCard key={market.id} market={market} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side={isDesktop ? "right" : "bottom"}
          className={cn(
            "border-[#E5E7EB] bg-white p-6 shadow-xl sm:max-w-full",
            isDesktop ? "h-full w-full max-w-md border-l" : "rounded-t-3xl border-t"
          )}
        >
          {selection && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="text-xl font-semibold text-[#111827]">
                  Confirm your prediction
                </SheetTitle>
                <SheetDescription className="text-sm text-[#4B5563]">
                  {selection.market.question}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm text-[#4B5563]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#111827]">You picked</span>
                    <span className="rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold text-[#217756] uppercase">
                      {selection.choice === "yes" ? "YES" : "NO"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span>Multiplier</span>
                    <span className="font-semibold text-[#111827]">
                      {selection.market.multiplier[selection.choice].toFixed(1)}x
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-[#4B5563]">
                  <label className="font-medium text-[#111827]" htmlFor="stake-input">
                    Stake amount
                  </label>
                  <div className="flex items-center rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
                    <input
                      id="stake-input"
                      type="number"
                      min={1}
                      step="1"
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
                        className={cn(
                          "flex-1 rounded-full px-3 py-2 text-sm font-semibold",
                          Number(stakeValue) === amount
                            ? "bg-[#35D07F] text-white"
                            : "bg-[#F3F4F6] text-[#4B5563]"
                        )}
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

                <Button className="w-full rounded-2xl bg-[#35D07F] text-base font-semibold text-white hover:bg-[#29b46e]">
                  Confirm with wallet
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}


