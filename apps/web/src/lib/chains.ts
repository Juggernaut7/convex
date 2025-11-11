import { defineChain } from "viem";

import { DEFAULT_CHAIN_ID, RPC_URL } from "@/lib/constants";

export const celoSepolia = defineChain({
  id: DEFAULT_CHAIN_ID,
  name: "Celo Sepolia",
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
      name: "Celo Explorer",
      url: "https://celo-sepolia.blockscout.com",
    },
  },
  testnet: true,
});

