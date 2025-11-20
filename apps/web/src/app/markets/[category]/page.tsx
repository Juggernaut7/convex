import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { CategoryTabs } from "@/components/markets/category-tabs";
import { MarketGallery } from "@/components/markets/market-gallery";
import { Button } from "@/components/ui/button";
import { MarketCategory } from "@/types/market";
import { fetchMarkets } from "@/lib/api/markets";
import { getTrendingMarkets } from "@/lib/markets/trending";

const categoryMap: Record<string, MarketCategory> = {
  sports: "Sports",
  crypto: "Crypto",
  culture: "Culture",
  custom: "Custom",
};

type CategoryMarketsPageProps = {
  params: { category: string };
};

export default async function CategoryMarketsPage({ params }: CategoryMarketsPageProps) {
  const slug = params.category?.toLowerCase();
  const category = (slug && categoryMap[slug]) || null;

  if (!category) {
    notFound();
  }

  const markets = await fetchMarkets();
  const filteredMarkets = markets.filter((market) => market.category === category);
  const trendingMarkets = getTrendingMarkets(filteredMarkets, 3);
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

  return (
    <main className="bg-[#F5F7FA] pb-20 pt-12 sm:pt-16">
      <Container className="space-y-12 lg:space-y-16">
        <header className="space-y-5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#217756]">
            {categoryLabel}
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-[#0F172A] sm:text-4xl">
              {categoryLabel} conviction pools.
            </h1>
            <p className="text-sm text-[#4B5563] sm:text-base">
              Markets curated for the {category.toLowerCase()} community. Pick a side and stake your conviction instantly.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <CategoryTabs activeCategory={category} />
            <Button
              asChild
              className="rounded-full bg-[#35D07F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#29b46e]"
            >
              <Link href="/create">Create market</Link>
            </Button>
          </div>
        </header>

        <MarketGallery
          markets={filteredMarkets}
          initialCategory={category}
          enableCategoryFilter={false}
          trendingMarkets={trendingMarkets}
        />
      </Container>
    </main>
  );
}
