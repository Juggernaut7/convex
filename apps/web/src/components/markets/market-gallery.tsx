"use client";

import { useMemo, useState } from "react";

import { MarketViewModel, MarketCategory } from "@/types/market";
import { MarketCard } from "@/components/markets/market-card";
import { MarketFilterBar } from "@/components/markets/market-filter-bar";
import { StakeSheet } from "@/components/markets/stake-sheet";

type MarketGalleryProps = {
  markets: MarketViewModel[];
  initialCategory?: MarketCategory | "All";
  enableCategoryFilter?: boolean;
  trendingMarkets?: MarketViewModel[];
};

export function MarketGallery({
  markets,
  initialCategory = "All",
  enableCategoryFilter = true,
  trendingMarkets,
}: MarketGalleryProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<MarketCategory | "All">(initialCategory);
  const [selection, setSelection] = useState<MarketViewModel | null>(null);
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);

  const categories = enableCategoryFilter
    ? (Array.from(
        new Set(markets.map((market) => market.category).filter((category): category is MarketCategory => !!category))
      ) as MarketCategory[])
    : [];

  const filteredMarkets = useMemo(() => {
    const filtered = markets.filter((market) => {
      const matchesCategory = activeCategory === "All" || market.category === activeCategory;
      const matchesSearch =
        market.title.toLowerCase().includes(search.toLowerCase()) ||
        market.description?.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    
    // Sort markets: Live first, then Closed/Resolved/Void at the bottom
    return filtered.sort((a, b) => {
      const statusOrder: Record<string, number> = { Live: 0, Closed: 1, Resolved: 2, Void: 3 };
      return (statusOrder[a.status] ?? 999) - (statusOrder[b.status] ?? 999);
    });
  }, [activeCategory, markets, search]);

  const handleStake = (market: MarketViewModel, candidateChoice: "yes" | "no") => {
    if (!market.canStake) return;
    setSelection(market);
    setChoice(candidateChoice);
  };

  return (
    <>
      <div className="sticky top-20 z-30 bg-[#F5F7FA] pb-4">
        <MarketFilterBar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onSearchChange={setSearch}
          showFiltersButton={enableCategoryFilter}
        />
      </div>

      {trendingMarkets && trendingMarkets.length > 0 && (
        <section className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A]">Trending now</h3>
              <p className="text-sm text-[#6B7280]">High-energy markets gaining traction.</p>
            </div>
          </div>
          <div className="-mx-1 flex gap-4 overflow-x-auto pb-2">
            {trendingMarkets.map((market) => (
              <div
                key={market.id}
                className="min-w-[240px] max-w-[260px] flex-none rounded-3xl border border-[#E5E7EB] bg-white/80 p-1 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <MarketCard market={market} onStake={handleStake} compact />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredMarkets.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-[#D1D5DB] bg-white/60 p-6 text-center text-sm text-[#6B7280]">
            No markets match your filters yet. Check back soon or create a new one.
          </div>
        ) : (
          filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} onStake={handleStake} />
          ))
        )}
      </div>
      <StakeSheet
        market={selection}
        choice={choice}
        open={Boolean(selection && choice)}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setSelection(null);
            setChoice(null);
          }
        }}
      />
    </>
  );
}
