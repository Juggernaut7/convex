import Link from "next/link";

import { Container } from "@/components/layout/container";
import { CreateMarketCard } from "@/components/home/create-market-card";
import { Button } from "@/components/ui/button";

export default function CreatePage() {
  return (
    <main className="bg-[#F5F7FA] pb-20 pt-12 sm:pt-16">
      <Container className="space-y-12 lg:space-y-16">
        <header className="space-y-5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#217756]">
            Creator workspace
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-[#0F172A] sm:text-4xl">
              Spin up a conviction market in minutes.
            </h1>
            <p className="text-sm text-[#4B5563] sm:text-base">
              Configure your question, pick the resolution window, and preview the experience before
              you publish. Once deployed, share the link and earn your creator fee automatically.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <Button asChild variant="outline" className="rounded-full border-[#E5E7EB] text-sm">
              <Link href="/#explore">Back to explore</Link>
            </Button>
            <span className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
              Markets settle on-chain • Rewards claimable instantly
            </span>
          </div>
        </header>

        <CreateMarketCard />
      </Container>
    </main>
  );
}


