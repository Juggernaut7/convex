import { Container } from "@/components/layout/container";
import { Trophy, Sparkles } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <main className="bg-[#F5F7FA] pb-20 pt-12 sm:pt-16">
      <Container className="max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-[#35D07F]/20 blur-3xl rounded-full" />
            <div className="relative rounded-full bg-[#E9F7EF] p-8">
              <Trophy className="h-16 w-16 text-[#35D07F]" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F7EF] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#217756]">
              <Sparkles className="h-4 w-4" />
              Coming Soon
            </div>
            <h1 className="text-4xl font-bold text-[#0F172A] sm:text-5xl">
              Top Earners Leaderboard
            </h1>
            <p className="text-lg text-[#4B5563] max-w-2xl mx-auto">
              Compete with the community and climb the ranks! Track your earnings, see where you stand, and celebrate your wins. The leaderboard is launching soon.
            </p>
          </div>

          <div className="mt-8 rounded-3xl border-2 border-[#E5E7EB] bg-white p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">What to Expect</h3>
            <ul className="space-y-3 text-left text-sm text-[#4B5563]">
              <li className="flex items-start gap-3">
                <span className="text-[#35D07F] mt-1">✓</span>
                <span>Real-time earnings tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#35D07F] mt-1">✓</span>
                <span>Top earners ranking system</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#35D07F] mt-1">✓</span>
                <span>Your personal ranking & stats</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#35D07F] mt-1">✓</span>
                <span>Competitive peerbar display</span>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </main>
  );
}

