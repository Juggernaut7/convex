# ConvexMarkets

ConvexMarkets is a modular prediction market protocol built for the Celo ecosystem. It combines on-chain conviction markets, a semi-automated oracle runner, and a polished Next.js frontend to deliver a hackathon-ready experience where users can create markets, stake outcomes, and claim winnings trustlessly once resolved.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)  
2. [Deployed Contracts](#deployed-contracts)  
3. [System Workflow](#system-workflow)  
4. [Repository Structure](#repository-structure)  
5. [Getting Started](#getting-started)  
6. [Environment Variables](#environment-variables)  
7. [Development Scripts](#development-scripts)  
8. [Testing the Flow](#testing-the-flow)  
9. [Security Practices](#security-practices)  
10. [Roadmap & Next Steps](#roadmap--next-steps)

---

## High-Level Architecture

| Layer         | Stack                             | Responsibilities                                                                                           |
| ------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Smart Contracts | Solidity (`apps/contracts`)        | Market factory and per-market logic, Chainlink automation hooks, staking, resolution, and claims.           |
| Chainlink Services | Functions Runtime, Automation, Price Feeds | Provide decentralized data and scheduled execution for crypto + sports conviction markets. |
| Frontend       | Next.js (`apps/web`)                | Market discovery, detail view, staking UI, claim flow, admin workspace; integrates directly with on-chain state via Wagmi/RainbowKit. |

The project follows a strict separation of concerns: each layer is independently deployable and communicates via well-defined interfaces (contract ABIs, REST APIs).

---

## Deployed Contracts

All contracts are deployed on **Celo Sepolia Testnet**.

| Contract                | Address                                      | Purpose                               |
| ----------------------- | -------------------------------------------- | ------------------------------------- |
| `ConvexMarketManager`   | _TBD (redeploying to Celo Alfajores)_        | Factory/registry for all markets.     |
| `MockERC20` (staking token) | _TBD (redeploying to Celo Alfajores)_        | Test token for staking (cUSD analogue). |

> **Note:** The manager grants `DEFAULT_ADMIN_ROLE`, `CREATOR_ROLE`, `RESOLVER_ROLE`, and `GUARDIAN_ROLE` to the deployer (resolver wallet) by default. Mint additional test tokens using the `mint` function on `MockERC20`.

---

## System Workflow

### Market Lifecycle

1. **Creator submits market**  
   - Admin wallet calls `ConvexMarketManager.createMarket` directly from the UI.  
   - Metadata URI encodes Chainlink feed/function info.

2. **Automation registration**  
   - Chainlink Automation is registered during market creation to trigger resolution at `endTime`.

3. **Trading period**  
   - Users stake on outcomes via the frontend using Wagmi contract interactions.

4. **Resolution**  
   - **Price markets:** Automation invokes the Chainlink Price Feed resolver which settles the outcome fully on-chain.  
   - **Sports markets:** Automation triggers Chainlink Functions, which fetches match data and calls back `resolveMarket`.

5. **Claiming payouts**  
   - Once resolved, users trigger `claim` from the UI; payouts are calculated and transferred on-chain.

6. **Post-resolution analytics**  
   - Frontend aggregates on-chain events (no centralized database required).

### Oracle + Automation

* Chainlink Price Feeds provide tamper-resistant crypto prices (ETH/USD, BTC/USD, CELO/USD).  
* Chainlink Functions runtime executes custom JS against trusted sports APIs without running servers.  
* Chainlink Automation schedules execution so no backend cron or resolver wallet is needed.

---

## Repository Structure

```
convex/
 ├─ apps/
 │   ├─ contracts/         # Hardhat-based Solidity workspace
 │   └─ web/               # Next.js frontend (Wagmi + RainbowKit)
 ├─ packages/
 │   └─ abi/               # (planned) shared ABI exports
 ├─ README.md
 └─ pnpm-workspace.yaml
```

Each `apps/*` directory is independently runnable with its own `.example` environment file.

---

## Getting Started

### Prerequisites

* Node.js 18+
* pnpm 8+
* Celo Alfajores RPC endpoint (e.g., https://alfajores-forno.celo-testnet.org)
* Testnet funds for the resolver wallet (for gas costs)
* Chainlink Functions + Automation access (Alfajores)

### Install Dependencies

```bash
pnpm install
```

### Contracts

```bash
cd apps/contracts
pnpm build         # compile Solidity
pnpm test          # run Hardhat tests
# optional: pnpm --filter hardhat exec -- hardhat ignition deploy ignition/modules/ConvexManager.ts --network sepolia
```

### Frontend

```bash
cd apps/web
pnpm dev           # start Next.js dev server
pnpm build         # production build
```

---

## Environment Variables

Copy `.example` files to `.env` / `.env.local` before running services.

### Contracts (`apps/contracts/.env`)

```
PRIVATE_KEY=<resolver/creator wallet private key>
RPC_URL=https://forno.celo-sepolia.celo-testnet.org
CHAIN_ID=11142220
STAKING_TOKEN_ADDRESS=0x6c23508A9b310C5f2eb2e2eFeBeB748067478667
TREASURY_ADDRESS=<protocol fee wallet>
RESOLVER_ADDRESS=<resolver wallet address>
CELOSCAN_API_KEY=<optional>
```

### Frontend (`apps/web/.env.local`)

```
NEXT_PUBLIC_RPC_URL=https://alfajores-forno.celo-testnet.org
NEXT_PUBLIC_CHAIN_ID=44787
NEXT_PUBLIC_MANAGER_ADDRESS=<deployed manager>
NEXT_PUBLIC_STAKING_TOKEN_ADDRESS=<cUSD mock or actual token>
NEXT_PUBLIC_WC_PROJECT_ID=<walletconnect project id>
```

---

## Development Scripts

| Command                                        | Description                               |
| ---------------------------------------------- | ----------------------------------------- |
| `pnpm install`                                 | Install all workspace dependencies.       |
| `pnpm --filter hardhat build`                  | Compile Solidity contracts.               |
| `pnpm --filter hardhat test`                   | Run contract test suite.                  |
| `pnpm --filter web dev`                        | Launch Next.js dev server.                |
| `pnpm --filter web build`                      | Build production frontend.                |
| `pnpm --filter hardhat exec -- <script>`       | Run Hardhat scripts (Ignition, etc.).     |

---

## Testing the Flow

1. **Seed a test market**
   - Use admin dashboard (once implemented) or call `createMarket` from Hardhat script.
   - Example Hardhat console snippet:
     ```bash
     pnpm --filter hardhat exec -- ts-node scripts/createMarket.ts
     ```

2. **Mint mock tokens**
   ```bash
   pnpm --filter hardhat exec -- ts-node scripts/mintMock.ts
   ```

3. **Stake via frontend**
   - Connect wallet, navigate to a market, stake `Yes` or `No`.

4. **Chainlink automation + resolution**
   - Register upkeep for the market when it is created.
   - Automation + Functions will fetch data and call `resolveMarket` without manual steps.

5. **Claim winnings**
   - Once resolved, claim button becomes active in UI.

---

## Security Practices

* **Hot wallets:** Resolver wallet should hold minimal funds; rotate keys if credentials leak.  
* **Role separation:** Use dedicated addresses for `ADMIN`, `CREATOR`, `RESOLVER`.  
* **Input validation:** UI validates creator inputs before calling the manager contract.  
* **Logging & monitoring:** Use Chainlink Functions + Automation logs plus on-chain events for debugging.  
* **Error handling:** Automation upkeeps are idempotent; guard resolver calls with ReentrancyGuard.

---

## Roadmap & Next Steps

1. **Finalize creator workflow**
   - Implement admin approval queue (Option B) or confirm alternative (pure wallet, hybrid).

2. **Shared ABI package**
   - Export contract ABIs via `/packages/abi` for consistent typings across contracts/frontend.

3. **Enhanced Chainlink Functions libraries**
   - Standardize JS snippets for football, rugby, and MMA data sources.

4. **On-chain analytics**
   - Build dashboards for protocol fees, market volume, resolution accuracy.

5. **Security audit checklist**
   - Verify reentrancy guards, access control tests, and admin overrides before production deployment.

6. **Deployment automation**
   - Add CI/CD pipelines for each `apps/*` project; integrate test suites and linting.

---

## Support & Contributions

This project is designed for hackathon velocity with clear modular boundaries. Contributions should respect the existing structure:

* Keep contracts and frontend ABIs in sync via the shared package.  
* Update `.example` files whenever new env vars are introduced.  
* Document any new scripts or flows in this README.  
* File issues with clear reproduction steps.

For questions or collaboration, reach out to the team lead or file an issue in the repository. Let’s ship something unforgettable at the hackathon! 🚀

# convex

a nex gen conviction market and sport prediction

A modern Celo blockchain application built with Next.js, TypeScript, and Turborepo.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

This is a monorepo managed by Turborepo with the following structure:

- `apps/web` - Next.js application with embedded UI components and utilities
- `apps/hardhat` - Smart contract development environment

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm type-check` - Run TypeScript type checking

### Smart Contract Scripts

- `pnpm contracts:compile` - Compile smart contracts
- `pnpm contracts:test` - Run smart contract tests
- `pnpm contracts:deploy` - Deploy contracts to local network
- `pnpm contracts:deploy:alfajores` - Deploy to Celo Alfajores testnet
- `pnpm contracts:deploy:sepolia` - Deploy to Celo Sepolia testnet
- `pnpm contracts:deploy:celo` - Deploy to Celo mainnet

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Smart Contracts**: Hardhat with Viem
- **Monorepo**: Turborepo
- **Package Manager**: PNPM

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Celo Documentation](https://docs.celo.org/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
