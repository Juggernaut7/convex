import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGO_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("1d"),
  RESOLVER_PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "resolver key must be 32-byte hex prefixed by 0x"),
  RPC_URL: z.string().url(),
  MANAGER_CONTRACT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "invalid contract address"),
  DEFAULT_MARKET_THRESHOLD: z.coerce.number().positive().default(4000),
  COINGECKO_API_KEY: z.string().optional(),
  SPORTS_API_KEY: z.string().optional(),
  ORACLE_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(60_000),
  ORACLE_MAX_RETRIES: z.coerce.number().int().positive().default(5),
  ALLOW_SELF_SIGNED_CERTS: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((value) => {
      if (typeof value === "boolean") return value;
      if (value === undefined) return false;
      return value === "true";
    })
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

