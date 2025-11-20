"use client";

import { useAccount } from "wagmi";
import { useMemo } from "react";
import { RESOLVER_ADDRESS } from "@/lib/constants";

/**
 * Hook to check if the connected wallet is the resolver address
 */
export function useIsResolver() {
  const { address, isConnected } = useAccount();
  
  const isResolver = useMemo(() => {
    if (!isConnected || !address || !RESOLVER_ADDRESS) {
      return false;
    }
    return address.toLowerCase() === RESOLVER_ADDRESS.toLowerCase();
  }, [address, isConnected]);

  return { isResolver, isConnected };
}

