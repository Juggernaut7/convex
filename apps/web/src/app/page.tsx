import { OnboardingCard } from "@/components/home/onboarding-card";
import { ConnectWalletCard } from "@/components/home/connect-card";
import { MyMarketsCard } from "@/components/home/my-markets-card";
import { CreateMarketCTA } from "@/components/home/create-cta-card";
import { MarketTabs } from "@/components/home/market-tabs";
import { Container } from "@/components/layout/container";
import { MarketCard } from "@/components/markets/market-card";
import { fetchMarkets } from "@/lib/api/markets";
import { getFeaturedMarkets, getTrendingMarkets } from "@/lib/markets/trending";

// Revalidate every 10 seconds to get fresh market data
export const revalidate = 10;

export default async function Home() {
  const markets = await fetchMarkets();

  const featuredMarkets = getFeaturedMarkets(markets, 3);
  const trendingMarkets = getTrendingMarkets(markets, 6);
  const liveMarkets = markets
    .filter((market) => market.status === "Live")
    .sort((a, b) => b.totalPool - a.totalPool)
    .slice(0, 6);

  return (
    <main className="bg-[#F5F7FA] pb-20 pt-12 sm:pt-16">
      <Container className="space-y-16 lg:space-y-20">
        <section
          id="hero"
          className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start"
        >
          <OnboardingCard />
          <ConnectWalletCard />
        </section>

        <section id="explore" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#0F172A] sm:text-3xl">
                Trending conviction markets
              </h2>
              <p className="mt-2 text-sm text-[#4B5563] sm:text-base">
                A snapshot of what the community is backing right now. Jump to the full board for more.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} compact />
            ))}
          </div>
          <div className="text-center">
            <a
              href="/markets"
              className="text-sm font-semibold text-[#217756] underline-offset-4 hover:underline"
            >
              View all markets →
            </a>
          </div>
        </section>

        <section id="live-board" className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#0F172A] sm:text-3xl">Live conviction board</h2>
          <MarketTabs markets={liveMarkets.length ? liveMarkets : markets} />
        </section>

        <section id="my-markets" className="space-y-6">
          <MyMarketsCard />
        </section>

        <section id="create" className="space-y-6">
          <CreateMarketCTA />
        </section>
      </Container>
    </main>
  );
}
