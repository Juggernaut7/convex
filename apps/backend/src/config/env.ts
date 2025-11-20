import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",

  mongoUri: process.env.MONGO_URI ?? "",

  rpcUrl: process.env.RPC_URL ?? "",
  chainId: Number(process.env.CHAIN_ID ?? "0"),
  managerAddress: process.env.MANAGER_CONTRACT_ADDRESS ?? "",

  resolverPrivateKey: process.env.RESOLVER_PRIVATE_KEY ?? "",

  coingeckoApiUrl:
    process.env.COINGECKO_API_URL ??
    "https://api.coingecko.com/api/v3/simple/price",

  sportsApiUrl: process.env.SPORTS_API_URL ?? "",
  sportsApiKey: process.env.SPORTS_API_KEY ?? "",

  oraclePollIntervalMs: Number(process.env.ORACLE_POLL_INTERVAL_MS ?? "60000"),
  oracleMaxRetries: Number(process.env.ORACLE_MAX_RETRIES ?? "5"),
  oracleCacheTtlSeconds: Number(
    process.env.ORACLE_CACHE_TTL_SECONDS ?? "60"
  ),
};

export function validateEnv() {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is required");
  }
  // Other fields (RPC_URL, CHAIN_ID, MANAGER_CONTRACT_ADDRESS, RESOLVER_PRIVATE_KEY, SPORTS_API_URL)
  // are optional for now and only required when actually resolving on-chain.
}


