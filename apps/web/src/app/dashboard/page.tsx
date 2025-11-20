"use client";

import { Container } from "@/components/layout/container";
import { DashboardPredictions } from "@/components/dashboard/predictions";
import { ConnectWalletCard } from "@/components/home/connect-card";
import { MyMarketsCard } from "@/components/home/my-markets-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function DashboardPage() {
  return (
    <main className="bg-[#F5F7FA] pb-20 pt-12 sm:pt-16">
      <Container className="space-y-12 lg:space-y-16">
        <header className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#217756]">
            Dashboard
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-[#0F172A] sm:text-4xl">
              Your conviction hub.
            </h1>
            <p className="text-sm text-[#4B5563] sm:text-base">
              Track active stakes, settle winnings, and manage your wallet in one place.
            </p>
          </div>
          <Button
            asChild
            className="rounded-full bg-[#35D07F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#29b46e]"
          >
            <Link href="/create">Create new market</Link>
          </Button>
        </header>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col gap-10">
            <ConnectWalletCard />
            <MyMarketsCard />
          </div>
          <DashboardPredictions />
        </section>
      </Container>
    </main>
  );
}
