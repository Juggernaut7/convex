# Convex Backend

Backend service for Convex conviction markets.

## Getting started

```bash
pnpm install
pnpm --filter convex-backend dev
```

## Environment variables

Create a `.env` inside `apps/backend` with the following keys:

| Key | Example | Notes |
| --- | --- | --- |
| `PORT` | `4000` | API port |
| `NODE_ENV` | `development` | Standard Node env |
| `MONGO_URI` | `mongodb+srv://abdulkabir0600_db_user:convex@cluster0.bwejb3q.mongodb.net/convex` | Provided cluster |
| `JWT_SECRET` | `2d4de621d5f15daa23d7d80609e002c25a2a236b3a3c5d630f1cdf6c16e0f23af594ee5aca3d8120a165de47dc3d533721c8d2f45ebdff9508834dbe64cfa3e3` | Replace with vaulted secret in prod |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime |
| `RESOLVER_PRIVATE_KEY` | `0x...` | Private key for oracle/market resolution |
| `RPC_URL` | `https://alfajores-forno.celo-testnet.org` | Celo RPC endpoint |
| `MANAGER_CONTRACT_ADDRESS` | `0x...` | Deployed `ConvexMarketManager` |
| `DEFAULT_MARKET_THRESHOLD` | `4000` | Example threshold for price markets |

All other credentials (API keys for sports / crypto feeds) should be appended as needed, e.g. `COINGECKO_API_KEY`, `SPORTS_API_KEY`.

