"use client";

import { ConnectButton as RainbowKitConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "./ui/button";

export function ConnectButton() {
  const [isMinipay, setIsMinipay] = useState(false);
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    // Check if we're in MiniPay environment
    if (typeof window !== 'undefined' && window.ethereum?.isMiniPay) {
      setIsMinipay(true);
    }
  }, []);

  if (isMinipay) {
    // Custom MiniPay UI
    return (
      <Button
        className="rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b152b]"
        onClick={() => {
          if (isConnected) {
            disconnect();
          } else {
            const injected = connectors.find((c) => c.id === "injected");
            if (injected) {
              connect({ connector: injected });
            }
          }
        }}
      >
        {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect MiniPay"}
      </Button>
    );
  }

  return (
    <RainbowKitConnectButton.Custom>
      {({ account, chain, mounted, openAccountModal, openConnectModal }) => {
        const connected = mounted && account && chain;

        return (
          <Button
            className="rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b152b]"
            onClick={() => {
              if (!connected) {
                openConnectModal();
              } else {
                openAccountModal();
              }
            }}
          >
            {connected ? account.displayName : "Connect wallet"}
          </Button>
        );
      }}
    </RainbowKitConnectButton.Custom>
  );
}

// Provide a backwards-compatible alias used elsewhere in the app
export const WalletConnectButton = ConnectButton;
