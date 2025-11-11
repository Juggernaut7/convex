"use client";

import { BadgeCheck, CircleDashed, DownloadCloud, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

const activity = [
  {
    id: "eth-close",
    question: "ETH above $4k today?",
    stake: 5,
    status: "Open",
    potential: 10.5,
    createdAt: "1h ago",
  },
  {
    id: "rugby-demo",
    question: "Cheetahs win by 7+ points?",
    stake: 3,
    status: "Settled",
    result: "Won 6.6 cUSD",
    createdAt: "2d ago",
  },
  {
    id: "btc-weekly-close",
    question: "BTC close above $70k this week?",
    stake: 4,
    status: "Open",
    potential: 7.6,
    createdAt: "3d ago",
  },
];

export function DashboardPredictions() {
  return (
    <section className="space-y-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#111827] sm:text-xl">Recent predictions</h2>
          <p className="text-sm text-[#6B7280]">Monitor positions and download history.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="inline-flex items-center gap-2 rounded-full border-[#E5E7EB] bg-white text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6]"
          >
            <DownloadCloud className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            className="inline-flex items-center gap-2 rounded-full border-[#E5E7EB] bg-white text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6]"
          >
            <ExternalLink className="h-4 w-4" />
            View on-chain
          </Button>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#F9FAFB]">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              <th className="px-6 py-3">Market</th>
              <th className="px-6 py-3">Stake</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Potential / payout</th>
              <th className="px-6 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] text-sm text-[#4B5563]">
            {activity.map((entry) => (
              <tr key={entry.id} className="transition hover:bg-[#F9FAFB]">
                <td className="px-6 py-4 text-[#111827]">{entry.question}</td>
                <td className="px-6 py-4">{entry.stake} cUSD</td>
                <td className="px-6 py-4">
                  {entry.status === "Open" ? (
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
                <td className="px-6 py-4">
                  {entry.status === "Settled" ? (
                    <span className="font-semibold text-[#217756]">{entry.result}</span>
                  ) : (
                    <span className="font-semibold text-[#111827]">
                      {entry.potential?.toFixed(1)} cUSD
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-[#6B7280]">{entry.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


