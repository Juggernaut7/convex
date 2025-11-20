"use client";

import { useCallback, useMemo, useState } from "react";
import { Loader2, RefreshCcw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarketViewModel, OutcomeSide } from "@/types/market";
import { ResolverMarketCard } from "@/components/resolver/resolver-market-card";
import { fetchMarketsClient, resolveMarketRequest } from "@/lib/api/markets";

type ResolverDashboardProps = {
  initialMarkets: MarketViewModel[];
};

export function ResolverDashboard({ initialMarkets }: ResolverDashboardProps) {
  const [markets, setMarkets] = useState<MarketViewModel[]>(initialMarkets);
  const [refreshing, setRefreshing] = useState(false);
  const [resolveMap, setResolveMap] = useState<Record<string, boolean>>({});
  const readyMarkets = useMemo(() => markets.filter((market) => market.resolverState.canResolve), [markets]);
  const upcomingMarkets = useMemo(
    () => markets.filter((market) => !market.resolverState.canResolve && market.status === "Live"),
    [markets]
  );
  const orderedMarkets = useMemo(() => {
    return markets.slice().sort((a, b) => {
      if (a.resolverState.canResolve !== b.resolverState.canResolve) {
        return a.resolverState.canResolve ? -1 : 1;
      }
      return new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime();
    });
  }, [markets]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const latest = await fetchMarketsClient();
      setMarkets(latest);
    } catch (error) {
      console.error("Failed to refresh resolver markets", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleResolve = useCallback(
    async (market: MarketViewModel, outcome: OutcomeSide) => {
      setResolveMap((prev) => ({ ...prev, [market.id]: true }));
      try {
        await resolveMarketRequest(market.id, outcome);
        await refresh();
      } finally {
        setResolveMap((prev) => {
          const { [market.id]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [refresh]
  );

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A] sm:text-3xl">Resolver control room</h1>
          <p className="mt-1 text-sm text-[#4B5563]">
            Review markets awaiting resolution. Live prices update automatically for oracle-configured markets.
          </p>
        </div>
        <Button
          variant="outline"
          className="inline-flex items-center gap-2 rounded-full border-[#E5E7EB] bg-white text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6]"
          onClick={refresh}
          disabled={refreshing}
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Refresh
        </Button>
      </header>

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <ShieldCheck className="h-4 w-4 text-[#35D07F]" />
          <span>
            {readyMarkets.length} market{readyMarkets.length === 1 ? "" : "s"} ready to resolve · {upcomingMarkets.length}{" "}
            upcoming
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {markets.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-[#D1D5DB] bg-white/60 p-10 text-center text-sm text-[#6B7280]">
              No markets found. Create a market first, then return here once it is live.
            </div>
          )}

          {orderedMarkets.map((market) => (
            <ResolverMarketCard
              key={market.id}
              market={market}
              onResolve={handleResolve}
              refreshing={refreshing || Boolean(resolveMap[market.id])}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

