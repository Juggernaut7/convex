"use client";

import Link from "next/link";

import { Container } from "@/components/layout/container";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="bg-[#F5F7FA] pb-20 pt-12 sm:pt-16">
      <Container className="grid max-w-3xl gap-12 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
        <section className="space-y-6 rounded-3xl bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#217756]">
              Admin Access
            </p>
            <h1 className="text-2xl font-semibold text-[#0F172A]">
              Sign in to manage conviction markets
            </h1>
            <p className="text-sm text-[#4B5563]">
              Use your creator credentials to publish, monitor, and resolve markets.
            </p>
          </div>
          <LoginForm />
        </section>
        <aside className="flex flex-col justify-between rounded-3xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-8 text-sm text-[#4B5563]">
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-[#0F172A]">
              Don&apos;t have access yet?
            </h2>
            <p>
              Reach out to the Convex core team to request creator credentials. We can onboard you
              in minutes and help you launch your first conviction market.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-[#6B7280]">
              Explore markets
            </p>
            <Button asChild variant="outline" className="w-full rounded-full border-[#E5E7EB]">
              <Link href="/markets">Browse active markets</Link>
            </Button>
            <Button asChild className="w-full rounded-full bg-[#111827] text-white hover:bg-[#0b152b]">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </aside>
      </Container>
    </main>
  );
}

