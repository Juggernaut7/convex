import { fetchMarkets } from "@/lib/api/markets";
import { ResolverDashboard } from "@/components/resolver/resolver-dashboard";

export const dynamic = "force-dynamic";

export default async function ResolverPage() {
  const markets = await fetchMarkets();
  return (
    <main className="bg-[#F5F7FA] pb-20 pt-12 sm:pt-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <ResolverDashboard initialMarkets={markets} />
      </div>
    </main>
  );
}

