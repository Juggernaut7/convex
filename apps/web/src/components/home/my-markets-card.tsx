"use client";

import { useAccount } from "wagmi";
import { BadgeCheck, CircleDashed } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useUserPositions } from "@/lib/hooks/use-user-positions";

export function MyMarketsCard() {
  const { isConnected } = useAccount();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { positions, isLoading } = useUserPositions();

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#111827] sm:text-xl">My predictions</h2>
          <p className="mt-1 hidden text-xs font-medium uppercase tracking-wide text-[#6B7280] sm:block">
            Track your open and settled markets
          </p>
        </div>
        <span className="text-xs font-medium text-[#6B7280]">
          {isConnected ? "Live" : "Connect to view"}
        </span>
      </div>

      {!isConnected ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-5 text-sm text-[#6B7280] sm:p-6">
          <p>Connect your wallet to see active predictions, claim rewards, and create new markets.</p>
        </div>
      ) : isLoading ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-5 text-sm text-[#6B7280] sm:p-6">
          <p>Loading your positions...</p>
        </div>
      ) : positions.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-5 text-sm text-[#6B7280] sm:p-6">
          <p>You haven't placed any stakes yet. Browse markets to get started!</p>
        </div>
      ) : isDesktop ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#E5E7EB]">
          <table className="min-w-full divide-y divide-[#E5E7EB]">
            <thead className="bg-[#F9FAFB]">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                <th className="px-6 py-3">Market</th>
                <th className="px-6 py-3">Choice</th>
                <th className="px-6 py-3">Stake</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-sm text-[#4B5563]">
              {positions.map((position) => (
                <tr key={position.market.id} className="transition hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4 text-[#111827]">
                    <Link href={`/market/${position.market.id}`} className="hover:underline">
                      {position.market.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold uppercase text-[#217756]">
                      {position.choice}
                    </span>
                  </td>
                  <td className="px-6 py-4">{(Number(position.totalStake) / 1e18).toFixed(2)} cUSD</td>
                  <td className="px-6 py-4">
                    {position.market.status === "Live" || position.market.status === "Closed" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#111827]">
                        <CircleDashed className="h-3.5 w-3.5 text-[#35D07F]" />
                        Awaiting result
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold text-[#217756]">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Settled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {position.canClaim ? (
                      <Button asChild className="rounded-xl bg-[#35D07F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#29b46e]">
                        <Link href={`/market/${position.market.id}`}>Claim reward</Link>
                      </Button>
                    ) : (
                      <span className="text-sm font-semibold text-[#111827]">
                        {position.potentialPayout > 0 ? `${position.potentialPayout.toFixed(2)} cUSD` : "--"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {positions.map((position) => (
            <article key={position.market.id} className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-[#6B7280]">
                <span className="font-semibold uppercase tracking-wide text-[#35D07F]">
                  {position.choice}
                </span>
                <span>{position.market.status === "Live" || position.market.status === "Closed" ? "Open" : "Settled"}</span>
              </div>
              <Link href={`/market/${position.market.id}`}>
                <p className="mt-2 text-sm font-semibold text-[#111827] sm:text-base hover:underline">
                  {position.market.title}
                </p>
              </Link>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-[#4B5563]">
                <span>Stake · {(Number(position.totalStake) / 1e18).toFixed(2)} cUSD</span>
                {position.market.status === "Live" || position.market.status === "Closed" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#111827]">
                    <CircleDashed className="h-3.5 w-3.5 text-[#35D07F]" />
                    Awaiting result · {position.potentialPayout > 0 ? `${position.potentialPayout.toFixed(2)} cUSD` : "--"}
                  </span>
                ) : (
                  <Button asChild className="inline-flex items-center gap-1 rounded-full bg-[#35D07F] px-3 py-1 text-xs font-semibold text-white hover:bg-[#29b46e]">
                    <Link href={`/market/${position.market.id}`}>
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Claim reward
                    </Link>
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


