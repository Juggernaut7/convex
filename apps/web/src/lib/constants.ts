import { type Address } from "viem";

function getEnv(
  name: string,
  { required = true, defaultValue }: { required?: boolean; defaultValue?: string } = {}
): string | undefined {
  const value = process.env[name];
  // Handle empty string, undefined, or whitespace-only values
  if (!value || value.trim().length === 0) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    if (required) {
      throw new Error(`Missing environment variable: ${name}`);
    }
    return undefined;
  }
  return value.trim();
}

export const MANAGER_CONTRACT_ADDRESS = getEnv("NEXT_PUBLIC_MANAGER_ADDRESS", {
  defaultValue: "0x0BD0DC85E111cA42363D8c67949c2A4ae85b1Bb7",
}) as Address;
export const STAKING_TOKEN_ADDRESS = getEnv("NEXT_PUBLIC_STAKING_TOKEN_ADDRESS", {
  defaultValue: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
}) as Address;
export const RPC_URL = getEnv("NEXT_PUBLIC_RPC_URL", {
  defaultValue: "https://forno.celo.org",
})!;
export const DEFAULT_CHAIN_ID = Number(
  getEnv("NEXT_PUBLIC_CHAIN_ID", { required: false, defaultValue: "42220" })
);

export const WALLET_CONNECT_PROJECT_ID = getEnv("NEXT_PUBLIC_WC_PROJECT_ID", { required: false });

export const RESOLVER_ADDRESS = getEnv("NEXT_PUBLIC_RESOLVER_ADDRESS", {
  required: false,
  defaultValue: "0xF39cE20c6A905157cF532890ed87b86f422774b7",
}) as Address;

export const API_BASE_URL = getEnv("NEXT_PUBLIC_API_BASE_URL", {
  required: false,
  // Use Render-hosted backend by default so the app works out-of-the-box with the live API
  defaultValue: "https://convex-q9pc.onrender.com",
});

// Log API URL to help debug (always log in browser to see what's being used)
if (typeof window !== "undefined") {
  const apiUrl = API_BASE_URL || "https://convex-q9pc.onrender.com";
  console.log(`[API_BASE_URL] Using: ${apiUrl}`);
  if (apiUrl.includes("localhost") && window.location.hostname !== "localhost") {
    console.warn(
      "[API_BASE_URL] ⚠️ WARNING: Using localhost API URL on hosted site!",
      "Set NEXT_PUBLIC_API_BASE_URL in Vercel environment variables."
    );
  }
}

