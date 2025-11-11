import { Check, Sparkles, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const integrationHighlights = [
  {
    title: "MiniPay native UX",
    points: [
      "Detects MiniPay environment automatically",
      "Preconfigured RPC with Celo Composer",
      "Gasless approvals for returning users",
    ],
    icon: Wallet,
  },
  {
    title: "Designed for mobile trust",
    points: [
      "Single-tap stake confirmations",
      "Readable odds, no hidden decimals",
      "Instant state sync after settlement",
    ],
    icon: Sparkles,
  },
];

export function MiniPaySection() {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Wallet className="h-4 w-4" />
              MiniPay experience layer
            </div>
            <h2 className="text-3xl font-semibold sm:text-4xl">Why Convex feels magical inside MiniPay</h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              MiniPay is the heartbeat of Convex. Every interaction—from browsing liquidity to claiming payouts—runs inside Celo&apos;s lightweight wallet. No context switches, no browser modals, just conviction trading that feels as smooth as a social app.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {integrationHighlights.map((highlight) => (
                <Card key={highlight.title} className="border-primary/30 bg-gradient-to-br from-background via-background to-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-primary">
                      <highlight.icon className="h-5 w-5" />
                      <CardTitle className="text-base font-semibold">{highlight.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {highlight.points.map((point) => (
                      <div key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-1 h-4 w-4 text-primary" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 shadow-xl">
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" />
              <div className="relative px-6 pb-8 pt-10">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">MiniPay Preview</p>
                <h3 className="mt-3 text-lg font-semibold text-foreground">Stake confirmation</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  MiniPay webview displays Convex&apos;s stake flow with native styling, keeping users in a trusted frame.
                </p>

                <div className="mt-6 space-y-3 rounded-xl border border-dashed border-primary/30 bg-background/70 p-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Stake amount</span>
                    <span>5 cUSD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Outcome</span>
                    <span>YES on ETH &gt; $4k</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Estimated payout</span>
                    <span>9.7 cUSD</span>
                  </div>
                </div>

                <div className="mt-8 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-lg">
                  Confirm in MiniPay
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 right-0 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}


