import { CheckCircle2, Globe, Lock, Timer } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    title: "Pick a market",
    description: "Curated sports, crypto, and culture events with clear odds and transparent liquidity.",
    icon: Globe,
  },
  {
    title: "Stake with MiniPay",
    description: "Tap the side you believe in, confirm inside MiniPay, and your stake is live in seconds.",
    icon: Timer,
  },
  {
    title: "Track conviction",
    description: "See market sentiment shift in real-time and follow signal from top predictors.",
    icon: CheckCircle2,
  },
  {
    title: "Cash out instantly",
    description: "Winning stakes settle straight to your MiniPay balance—no additional steps needed.",
    icon: Lock,
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-foreground/5 py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">How Convex flows with MiniPay</h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            We obsess over clean mobile UX so you can focus on what matters—conviction, not complexity.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((step) => (
            <Card key={step.title} className="border-border/60 bg-background">
              <CardContent className="flex gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}


