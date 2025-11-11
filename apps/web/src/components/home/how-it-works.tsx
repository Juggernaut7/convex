"use client";

import { CheckCircle2, Clock3, Smartphone, Wallet } from "lucide-react";

const steps = [
  {
    title: "Pick a market",
    description: "Browse curated sports, crypto, and culture questions with transparent odds.",
    icon: CheckCircle2,
  },
  {
    title: "Stake in one tap",
    description: "Choose your side, confirm with your connected wallet, and you’re live instantly.",
    icon: Smartphone,
  },
  {
    title: "Track conviction",
    description: "Watch pools and sentiment update in real-time across every open market.",
    icon: Clock3,
  },
  {
    title: "Claim rewards",
    description: "Once resolved, winnings settle straight to your wallet—no extra steps.",
    icon: Wallet,
  },
];

export function HowItWorks() {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold text-[#217756]">
          How Convex flows
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[#0F172A] sm:text-3xl">
            Simple, social prediction loops.
          </h2>
          <p className="text-sm leading-relaxed text-[#4B5563] sm:text-base">
            We package MiniPay-native UX into four lightweight steps so your users can focus on
            conviction, not complexity.
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {steps.map((step) => (
          <div
            key={step.title}
            className="flex items-start gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#35D07F]/10 text-[#35D07F]">
              <step.icon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[#111827]">{step.title}</h3>
              <p className="text-sm text-[#4B5563]">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


