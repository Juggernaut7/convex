"use client";

import { useAccount } from "wagmi";
import { BadgeCheck, CircleDashed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

const samplePredictions = [
  {
    id: "eth-close",
    question: "ETH above $4k today?",
    choice: "YES",
    stake: 5,
    status: "Open",
    potential: 10.5,
  },
  {
    id: "rugby-demo",
    question: "Cheetahs win by 7+ points?",
    choice: "NO",
    stake: 3,
    status: "Settled",
    result: "Won 6.6 cUSD",
  },
];

export function MyMarketsCard() {
  const { isConnected } = useAccount();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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
              {samplePredictions.map((prediction) => (
                <tr key={prediction.id} className="transition hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4 text-[#111827]">{prediction.question}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold uppercase text-[#217756]">
                      {prediction.choice}
                    </span>
                  </td>
                  <td className="px-6 py-4">{prediction.stake} cUSD</td>
                  <td className="px-6 py-4">
                    {prediction.status === "Open" ? (
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
                    {prediction.status === "Settled" ? (
                      <Button className="rounded-xl bg-[#35D07F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#29b46e]">
                        Claim {prediction.result?.replace("Won ", "") ?? "reward"}
                      </Button>
                    ) : (
                      <span className="text-sm font-semibold text-[#111827]">
                        {typeof prediction.potential === "number"
                          ? `${prediction.potential.toFixed(1)} cUSD`
                          : "--"}
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
          {samplePredictions.map((prediction) => (
            <article key={prediction.id} className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-[#6B7280]">
                <span className="font-semibold uppercase tracking-wide text-[#35D07F]">
                  {prediction.choice}
                </span>
                <span>{prediction.status}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[#111827] sm:text-base">{prediction.question}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-[#4B5563]">
                <span>Stake · {prediction.stake} cUSD</span>
                {prediction.status === "Open" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#111827]">
                    <CircleDashed className="h-3.5 w-3.5 text-[#35D07F]" />
                    Awaiting result · {prediction.potential.toFixed(1)} cUSD
                  </span>
                ) : (
                  <Button className="inline-flex items-center gap-1 rounded-full bg-[#35D07F] px-3 py-1 text-xs font-semibold text-white hover:bg-[#29b46e]">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Claim {prediction.result?.replace("Won ", "")}
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


