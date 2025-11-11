import { ArrowUpRight, Flame, LineChart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type Market = {
  id: string;
  title: string;
  category: "Sports" | "Crypto" | "Culture";
  expiresIn: string;
  totalPool: string;
  conviction: {
    yes: number;
    no: number;
  };
};

const mockMarkets: Market[] = [
  {
    id: "afcon-final",
    title: "Will Nigeria lead at half-time in the AFCON final?",
    category: "Sports",
    expiresIn: "2h 18m",
    totalPool: "1,820 cUSD",
    conviction: {
      yes: 68,
      no: 32,
    },
  },
  {
    id: "eth-weekly-close",
    title: "Will ETH close above $4k this week?",
    category: "Crypto",
    expiresIn: "3d 4h",
    totalPool: "2,430 cUSD",
    conviction: {
      yes: 54,
      no: 46,
    },
  },
  {
    id: "africa-stream",
    title: "Will the AfroFuture headline stream hit 250k live viewers?",
    category: "Culture",
    expiresIn: "18h 41m",
    totalPool: "950 cUSD",
    conviction: {
      yes: 41,
      no: 59,
    },
  },
];

function ConvictionBar({ yes, no }: { yes: number; no: number }) {
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full bg-primary transition-all" style={{ width: `${yes}%` }} />
      <div className="h-full bg-foreground/20 transition-all" style={{ width: `${no}%` }} />
    </div>
  );
}

export function TrendingMarketsSection() {
  return (
    <section id="markets" className="bg-background py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 flex flex-col gap-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 self-center rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs font-medium text-muted-foreground sm:self-start">
            <Flame className="h-4 w-4 text-primary" />
            Live conviction markets
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold sm:text-4xl">Back your instincts in seconds</h2>
              <p className="text-base text-muted-foreground sm:max-w-xl">
                Tap into community-powered liquidity. Tap a side, sign in MiniPay, and you&apos;re live on-chain—no extra wallets, no clunky UX.
              </p>
            </div>
            <Button variant="outline" className="inline-flex items-center gap-2 rounded-full border-primary/50 text-primary hover:bg-primary/10">
              View market builder <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockMarkets.map((market) => (
            <Card key={market.id} className="group border-border/60 bg-gradient-to-br from-background via-background to-primary/5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">{market.category}</span>
                  <span className="text-xs text-muted-foreground">Closes in {market.expiresIn}</span>
                </div>
                <CardTitle className="text-lg font-semibold leading-snug">{market.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total pool</span>
                  <span className="font-medium">{market.totalPool}</span>
                </div>
                <div className="space-y-2">
                  <ConvictionBar yes={market.conviction.yes} no={market.conviction.no} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>YES {market.conviction.yes}%</span>
                    <span>NO {market.conviction.no}%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <Button size="sm" className="rounded-full px-4">
                  Back YES
                </Button>
                <Button size="sm" variant="outline" className="rounded-full border-foreground/20">
                  Fade NO
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-6 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <LineChart className="h-9 w-9 text-primary" />
            <div>
              <p className="text-base font-semibold">Creator boost is live</p>
              <p className="text-sm text-muted-foreground">Stake 50 cUSD to launch a verified market and earn 1% fees on every settlement.</p>
            </div>
          </div>
          <Button size="lg" className="rounded-full px-7">Launch a market</Button>
        </div>
      </div>
    </section>
  );
}


