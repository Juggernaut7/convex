import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { MarketDetailView } from "@/components/markets/market-detail-view";
import { fetchMarketById } from "@/lib/api/markets";

type MarketDetailPageProps = {
  params: { id: string };
};

export default async function MarketDetailPage({ params }: MarketDetailPageProps) {
  const market = await fetchMarketById(params.id);

  if (!market) {
    notFound();
  }

  return (
    <main className="bg-[#F5F7FA] pb-20 pt-12 sm:pt-16">
      <Container className="space-y-12 lg:space-y-16">
        <MarketDetailView market={market} />
      </Container>
    </main>
  );
}
