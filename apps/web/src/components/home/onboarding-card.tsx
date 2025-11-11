import Link from "next/link";

import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    title: "Live odds",
    description: "Real-time pools with transparent odds and price discovery.",
  },
  {
    title: "Wallet native",
    description: "Works with MiniPay and every EVM wallet out of the box.",
  },
  {
    title: "Instant claims",
    description: "Tap once to withdraw winnings as soon as markets resolve.",
  },
] as const;

const WHY_CONVEX = [
  "No-code onboarding for casual fans.",
  "Creator rewards that pay out automatically.",
  "Built on Celo for instant, low-fee payouts.",
] as const;

export function OnboardingCard() {
  return (
    <section className="overflow-hidden rounded-3xl bg-white p-6 shadow-sm sm:p-10">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold text-[#217756]">
          Real stakes. Real payouts.
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-balance text-3xl font-semibold leading-tight text-[#0F172A] sm:text-[44px] sm:leading-[1.1]">
              Trade your conviction. Predict and win cUSD.
            </h1>
            <p className="text-base leading-relaxed text-[#4B5563]">
              Convex makes prediction markets feel like your favourite group chat—pick a side, stake
              instantly, and share wins with friends. No gas sliders, no jargon, just clean, social
              UX.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 text-sm text-[#4B5563]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Why Convex
            </p>
            <ul className="mt-4 space-y-3 leading-relaxed">
              {WHY_CONVEX.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-[#35D07F]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex h-full flex-col gap-3 rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 lg:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#35D07F]">
                {feature.title}
              </p>
              <p className="text-sm font-semibold text-[#111827] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <Button
          asChild
          className="w-full rounded-2xl bg-[#35D07F] text-base font-semibold text-white hover:bg-[#29b46e] sm:w-auto sm:px-8"
        >
          <Link href="/markets">Explore markets</Link>
        </Button>
      </div>
    </section>
  );
}
