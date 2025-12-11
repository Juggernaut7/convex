import { defineChain } from "viem";

import { DEFAULT_CHAIN_ID, RPC_URL } from "@/lib/constants";

export const celoMainnet = defineChain({
  id: DEFAULT_CHAIN_ID,
  name: "Celo",
  nativeCurrency: { decimals: 18, name: "CELO", symbol: "CELO" },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
    public: {
      http: [RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "CeloScan",
      url: "https://celoscan.io",
    },
  },
  testnet: false,
});

// Keep celoSepolia export for backwards compatibility, but it now points to mainnet
export const celoSepolia = celoMainnet;

