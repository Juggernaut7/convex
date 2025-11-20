"use client";

import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { WagmiProvider, createConfig, http, useConnect } from "wagmi";

import { WALLET_CONNECT_PROJECT_ID, RPC_URL } from "@/lib/constants";
import { celoSepolia } from "@/lib/chains";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [injectedWallet],
    },
  ],
  {
    appName: "convex",
    projectId: WALLET_CONNECT_PROJECT_ID ?? "",
  }
);

const wagmiConfig = createConfig({
  chains: [celoSepolia],
  connectors,
  transports: {
    [celoSepolia.id]: http(RPC_URL),
  },
  ssr: true,
});

const queryClient = new QueryClient();

function WalletProviderInner({ children }: { children: React.ReactNode }) {
  const { connect, connectors } = useConnect();

  useEffect(() => {
    const autoConnect = async () => {
      try {
        if (typeof window !== "undefined" && (window as any).ethereum?.isMiniPay) {
          const injectedConnector = connectors.find((c) => c.id === "injected");
          if (injectedConnector) {
            await connect({ connector: injectedConnector });
          }
        }
      } catch (error) {
        console.error("Failed to auto-connect to MiniPay:", error);
      }
    };
    
    void autoConnect();
  }, [connect, connectors]);

  return <>{children}</>;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <WalletProviderInner>{mounted ? children : null}</WalletProviderInner>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
