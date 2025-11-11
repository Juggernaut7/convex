import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CallToActionSection() {
  return (
    <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 py-20 text-primary-foreground">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="space-y-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">Ready for the hackathon floor</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Ship your MiniPay-powered conviction market with Convex in under two weeks.
          </h2>
          <p className="mx-auto max-w-2xl text-base text-primary-foreground/80 sm:text-lg">
            Fork the repo, deploy to Alfajores, and showcase a buttery mobile UX that Celo judges love. We already handle wallet detection, stake flows, and payout scaffolding—so you can focus on product polish.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary">
              <Link href="https://github.com/soliuafeez/convex" target="_blank">
                View GitHub repo
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/70 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link href="https://minipay.celo.org" target="_blank">
                Explore MiniPay docs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}


