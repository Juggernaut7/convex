import Link from "next/link";

import { Container } from "@/components/layout/container";
import { MarketGallery } from "@/components/markets/market-gallery";
import { Button } from "@/components/ui/button";
import { fetchMarkets } from "@/lib/api/markets";

export default async function MarketsPage() {
  const markets = await fetchMarkets();
  const trendingMarkets = markets.filter((market) => market.status === "Live").slice(0, 4);

  return (
    <main className="bg-[#F5F7FA] pb-20 pt-12 sm:pt-16">
      <Container className="space-y-12 lg:space-y-16">
        <header className="space-y-5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#217756]">
            Markets
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-[#0F172A] sm:text-4xl">
              Explore conviction markets.
            </h1>
            <p className="text-sm text-[#4B5563] sm:text-base">
              Browse live pools across sports, crypto, and culture. Stake your conviction in seconds with wallet-native UX.
            </p>
          </div>
          <Button
            asChild
            className="rounded-full bg-[#35D07F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#29b46e]"
          >
            <Link href="/create">Create market</Link>
          </Button>
        </header>

        <MarketGallery markets={markets} initialCategory="All" trendingMarkets={trendingMarkets} />
      </Container>
      <Link
        href="/create"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0b152b]"
      >
        <span>+ Create market</span>
      </Link>
    </main>
  );
}
