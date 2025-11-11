"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { PlugZap, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";

const CUSD_ADDRESS = "0x765de816845861e75a25fca122bb6898b8b1282a" as const;

function formatAddress(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function ConnectWalletCard() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();
  const [isMiniPayEnv, setIsMiniPayEnv] = useState<boolean | null>(null);
  const [hasConnector, setHasConnector] = useState(true);

  const injectedConnector = useMemo(
    () => connectors.find((connector) => connector.id === "injected"),
    [connectors]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const detected = Boolean(
      (window as typeof window & { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay
    );
    setIsMiniPayEnv(detected);
    setHasConnector(Boolean((window as typeof window & { ethereum?: unknown }).ethereum));
  }, []);

  const { data: cusdBalance, isLoading: isBalanceLoading } = useBalance({
    address,
    token: CUSD_ADDRESS,
    query: { enabled: Boolean(address) },
  });

  const isConnecting = connectStatus === "pending";

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#111827]">Connect your wallet</h2>
          <span className="text-xs font-medium text-[#6B7280]">
            {isConnected
              ? "Connected"
              : hasConnector
              ? isMiniPayEnv
                ? "MiniPay detected"
                : "Wallet ready"
              : "No wallet found"}
          </span>
        </div>

        {!isConnected && (
          <p className="text-sm text-[#4B5563]">
            {hasConnector
              ? "Connect with your preferred wallet to track stakes, manage markets, and claim payouts."
              : "No compatible wallet found. Install a browser wallet or open this experience inside MiniPay."}
          </p>
        )}

        <div className="space-y-3">
          {isConnected ? (
            <>
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Wallet
                </div>
                <div className="mt-1 text-sm font-medium text-[#111827]">
                  {address && formatAddress(address)}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-[#4B5563]">
                  <span>cUSD balance</span>
                  <span className="font-semibold text-[#111827]">
                    {isBalanceLoading
                      ? "Loading..."
                      : Number(cusdBalance?.formatted || 0).toFixed(2)}{" "}
                    cUSD
                  </span>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button className="rounded-2xl bg-[#111827] text-sm font-semibold text-white hover:bg-[#0b152b]">
                  View portfolio
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl border-[#E5E7EB] text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6]"
                >
                  Claim rewards
                </Button>
              </div>
            </>
          ) : (
            <Button
              disabled={!injectedConnector || isConnecting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#35D07F] text-base font-semibold text-white hover:bg-[#29b46e]"
              onClick={() => {
                if (!injectedConnector) return;
                connect({ connector: injectedConnector });
              }}
            >
              <Wallet className="h-5 w-5" />
              {isConnecting ? "Connecting..." : "Connect wallet"}
            </Button>
          )}

          {!hasConnector && (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#FBBF24] bg-[#FFFBEB] px-4 py-3 text-xs font-semibold text-[#B45309]">
              <PlugZap className="h-4 w-4" />
              Install a wallet extension or open in MiniPay
            </div>
          )}
        </div>

        {isConnected && (
          <Button
            variant="ghost"
            className="w-full rounded-2xl border border-transparent bg-transparent text-sm font-semibold text-[#EF4444] hover:border-[#FECACA] hover:bg-[#FEF2F2]"
            onClick={() => disconnect()}
          >
            Disconnect
          </Button>
        )}
      </div>
    </section>
  );
}


