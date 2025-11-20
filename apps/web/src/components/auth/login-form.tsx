"use client";

import { useState } from "react";
import { useAccount, useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, this is a placeholder
    // In a full implementation, this would handle backend authentication
    if (isConnected) {
      // User is already connected via wallet
      return;
    }
    // Encourage wallet connection
    openConnectModal?.();
  };

  if (isConnected) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#35D07F] bg-[#E9F7EF] p-4">
          <p className="text-sm font-semibold text-[#217756]">Wallet Connected</p>
          <p className="mt-1 text-xs text-[#4B5563]">
            {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
          </p>
        </div>
        <Button
          asChild
          className="w-full rounded-2xl bg-[#35D07F] text-sm font-semibold text-white hover:bg-[#29b46e]"
        >
          <a href="/resolver">Go to Resolver Dashboard</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-[#111827]">
          Email (Optional)
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="rounded-2xl border-[#E5E7EB] bg-white"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-[#111827]">
          Password (Optional)
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="rounded-2xl border-[#E5E7EB] bg-white"
        />
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-xs text-[#4B5563]">
        <p className="font-semibold text-[#111827] mb-1">Note:</p>
        <p>
          Convex uses wallet-based authentication. Connect your wallet to access creator and resolver features.
        </p>
      </div>
      <Button
        type="button"
        onClick={() => openConnectModal?.()}
        className="w-full rounded-2xl bg-[#35D07F] text-sm font-semibold text-white hover:bg-[#29b46e]"
      >
        Connect Wallet
      </Button>
    </form>
  );
}

