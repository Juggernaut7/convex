import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WalletConnectButton } from "@/components/connect-button";
import { UserBalance } from "@/components/user-balance";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 pb-24 pt-16">
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,_rgba(10,102,255,0.15),_transparent_60%)]" />
      <div className="container relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 text-center lg:flex-row lg:items-center lg:text-left">
        <div className="flex-1 space-y-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Built for Celo MiniPay Hackathon
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Trade your conviction on the moments that matter.
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Convex lets fans back their instincts on sports, culture, and crypto with instant cUSD payouts powered by MiniPay. No friction, no gas surprises—just clean, social prediction markets that feel native on mobile.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
            <div className="w-full max-w-xs sm:max-w-none">
              <WalletConnectButton />
            </div>
            <Button asChild size="lg" variant="ghost" className="h-12 rounded-full px-7 text-base font-semibold">
              <Link href="#markets" className="flex items-center gap-2">
                Explore live markets <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <ShieldCheck className="h-5 w-5 text-primary" />,
                title: "Non-custodial",
                copy: "Funds stay in smart contracts with transparent settlement.",
              },
              {
                icon: <Trophy className="h-5 w-5 text-primary" />,
                title: "Play-to-earn ready",
                copy: "Reward early conviction with streaks, XP, and creator boosts.",
              },
              {
                icon: <Sparkles className="h-5 w-5 text-primary" />,
                title: "MiniPay native",
                copy: "Optimized for mobile flows with instant cUSD confirmations.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-primary/10 bg-background/80 backdrop-blur">
                <CardContent className="space-y-3 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.copy}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <Card className="border-primary/20 bg-background/60 backdrop-blur">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="space-y-2 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Next feature drop</p>
                <h2 className="text-2xl font-semibold text-foreground">Conviction Vaults</h2>
                <p className="text-sm text-muted-foreground">
                  Pool liquidity, boost odds, and earn fees every time your community’s market settles. Built on top of Celo&apos;s ultra-low gas.
                </p>
              </div>

              <div className="space-y-3 text-left">
                <p className="text-sm font-medium">Currently live on:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Celo Alfajores (testnet)</li>
                  <li>• cUSD settlement rails</li>
                  <li>• MiniPay wallet flow</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-left">
                <p className="text-xs uppercase tracking-wide text-primary">Prototype wallet</p>
                <UserBalance />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}


