import { type Address } from "viem";

function getEnv(
  name: string,
  { required = true, defaultValue }: { required?: boolean; defaultValue?: string } = {}
): string | undefined {
  const value = process.env[name];
  if (!value || value.length === 0) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    if (required) {
      throw new Error(`Missing environment variable: ${name}`);
    }
    return undefined;
  }
  return value;
}

export const API_BASE_URL = getEnv("NEXT_PUBLIC_API_BASE_URL", {
  defaultValue: "http://localhost:4000/api",
})!;
export const MANAGER_CONTRACT_ADDRESS = getEnv("NEXT_PUBLIC_MANAGER_ADDRESS", {
  defaultValue: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
}) as Address;
export const STAKING_TOKEN_ADDRESS = getEnv("NEXT_PUBLIC_STAKING_TOKEN_ADDRESS", {
  defaultValue: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
}) as Address;
export const RPC_URL = getEnv("NEXT_PUBLIC_RPC_URL", {
  defaultValue: "https://forno.sepolia.celo-testnet.org",
})!;
export const DEFAULT_CHAIN_ID = Number(
  getEnv("NEXT_PUBLIC_CHAIN_ID", { required: false, defaultValue: "11142220" })
);

export const WALLET_CONNECT_PROJECT_ID = getEnv("NEXT_PUBLIC_WC_PROJECT_ID", { required: false });

