"use client";

import Link from "next/link";
import { Rocket, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CreateMarketCTA() {
  return (
    <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold text-[#217756]">
            <Rocket className="h-4 w-4" />
            Creator studio
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[#0F172A] sm:text-3xl">
              Launch a market in minutes.
            </h2>
            <p className="text-sm leading-relaxed text-[#4B5563] sm:text-base">
              Reward the community with the questions they care about. Set your entry fee, closing
              time, and earn a creator fee on every settlement.
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-[#4B5563] sm:flex-row sm:gap-6">
            <li className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-[#35D07F]" />
              Peer-to-peer native
            </li>
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#35D07F]" />
              Manual or oracle resolution
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-3 lg:w-auto">
          <Button
            asChild
            className="rounded-2xl bg-[#35D07F] px-8 py-3 text-base font-semibold text-white hover:bg-[#29b46e]"
          >
            <Link href="/create">Open creator workspace</Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="rounded-2xl border-[#E5E7EB] px-8 py-3 text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6]"
          >
            <Link href="/#learn">Review the flow</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}


