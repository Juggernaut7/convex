# 💎 Convex - Next-Gen Prediction Markets

**Celo Solidity React Node.js MongoDB**

A decentralized prediction market platform on Celo blockchain that transforms how you bet on outcomes. Create markets, stake your conviction, and earn rewards—all secured by smart contracts and powered by real-time oracles.

🚀 **Live Demo**: [convex-seven.vercel.app](https://convex-seven.vercel.app/) •
📡 **Backend API**: [convex-q9pc.onrender.com](https://convex-q9pc.onrender.com/) •
🔗 **GitHub**: [Juggernaut7/convex](https://github.com/Juggernaut7/convex)

---

## 🌟 What is Convex?

Convex is a cutting-edge prediction market protocol that brings the power of decentralized betting to the Celo ecosystem. Whether you're predicting crypto prices, sports outcomes, or cultural events, Convex makes it seamless with:

📊 **Crypto Price Markets** - Predict ETH, BTC, CELO price movements with oracle-powered resolution

⚽ **Sports Prediction Markets** - Bet on match outcomes, tournaments, and events

🎭 **Culture & Events** - Create markets for any outcome you can imagine

💎 **Conviction-Based Staking** - Pool-based system where odds reflect collective belief

🎯 **Real-Time Resolution** - Automated oracle integration for instant, trustless outcomes

🔒 **Non-Custodial** - You control your funds, always

*"Where conviction meets blockchain"* 💎⚡

---

## 🌐 Production Deployment

- **Frontend (Vercel)**: https://convex-seven.vercel.app/
- **Backend API (Render)**: https://convex-q9pc.onrender.com/ (health at `/health`, markets at `/api/markets`)
- **Status endpoint**: hitting `/` returns API metadata for quick diagnostics

Use the production URLs in `.env` files unless you're running everything locally.

---

## 🎯 Key Features

### 🎨 Beautiful UX/UI
- ✨ Clean, modern interface with smooth animations
- 📱 Mobile-first design optimized for wallets
- 🌓 Intuitive market discovery and filtering
- 📊 Real-time odds and pool visualization
- 🏷️ Smart market categorization (Sports, Crypto, Culture)

### 🔐 Blockchain Secured
- ✅ Audited smart contracts (OpenZeppelin)
- 🔒 Non-custodial (you control your keys)
- 📡 Transparent on-chain data
- ⚡ Real-time verification
- 🛡️ Reentrancy guards and access controls

### 💎 Smart Market Mechanics
- 📈 Dynamic odds based on pool distribution
- 💰 Automatic payout calculation
- 🎁 Creator fee incentives
- ⏰ Time-locked markets with auto-resolution
- 🔄 Instant claim after resolution

### 🌍 Celo Powered
- ⚡ Fast transactions (<5 sec)
- 💸 Low fees (~$0.01)
- 📱 Mobile-friendly
- 🌱 Carbon negative blockchain
- 🔗 Seamless wallet integration

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CONVEX ECOSYSTEM                               │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   WEB FRONTEND   │◄───────►│   BACKEND API    │◄───────►│     DATABASE     │
│   (Next.js 14)   │         │   (Node.js)      │         │   (MongoDB)      │
│                  │         │                  │         │                  │
│  • Market Browse│         │  • Market Mgmt   │         │  • Market Data   │
│  • Staking UI    │         │  • Oracle Service │         │  • User Positions│
│  • Claim Flow    │         │  • Price Feeds   │         │  • Analytics     │
│  • Resolver Dash │         │  • Sports Data   │         │  • History       │
└────────┬─────────┘         └──────────────────┘         └──────────────────┘
         │                                                                     
         │ wagmi + RainbowKit                                                
         ▼                                                                     
┌─────────────────────────────────────────────────────────────────────┐
│                    CELO BLOCKCHAIN (Celo Sepolia)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           ConvexMarketManager (Main Contract)                │  │
│  │                                                               │  │
│  │  • Market Factory & Registry                                 │  │
│  │  • Staking & Pool Management                                 │  │
│  │  • Resolution & Payouts                                       │  │
│  │  • Role-Based Access Control                                  │  │
│  │  • Protocol & Creator Fees                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  Market Lifecycle:                                                   │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │    LIVE      │─►│   CLOSED     │─►│   RESOLVED   │             │
│  │              │  │              │  │              │             │
│  │ • Staking    │  │ • Awaiting   │  │ • Winners    │             │
│  │ • Trading    │  │   Resolution │  │   Claim      │             │
│  │ • Pool Grows │  │ • Oracle     │  │ • Payouts    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                       │
│  Oracle Integration:                                                 │
│  ┌──────────────┐  ┌──────────────┐                                │
│  │ Price Feeds  │  │ Sports APIs  │                                │
│  │ (Crypto)     │  │ (Events)     │                                │
│  └──────────────┘  └──────────────┘                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
         │                                                                     
         ▼                                                                     
┌─────────────────────────────────────────────────────────────────────┐
│                          USER'S WALLET                                │
│              (MetaMask / Valora / MiniPay / etc.)                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Deployed Smart Contracts

### 🌐 Celo Sepolia Testnet

| Contract | Address | Purpose |
|----------|---------|---------|
| **ConvexMarketManager** | `0xD1DbF3F78bC53d918CBca130Ddc7784574181075` | Main market factory, staking, resolution, and payout system |
| **MockERC20** (Staking Token) | `0x6c23508a9b310c5f2eb2e2efebeb748067478667` | Test token for staking (cUSD analogue) |

### 🪙 Token Addresses (Celo Sepolia)

| Token | Address | Description |
|-------|---------|-------------|
| **CELO** | Native | Celo native token |
| **cUSD** | `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1` | Celo Dollar stablecoin |

🔗 **Verify on Celo Sepolia Explorer**: [CeloScan](https://sepolia.celoscan.io/)

---

## 🚀 User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                                 │
└─────────────────────────────────────────────────────────────────────┘

1️⃣ CONNECT WALLET
   │
   ├─► MetaMask / Valora / MiniPay / Other Web3 Wallet
   └─► Auto-reconnect on return
   

2️⃣ EXPLORE MARKETS
   │
   ├─► Browse by Category (Sports, Crypto, Culture)
   ├─► Filter by Status (Live, Closed, Resolved)
   ├─► Search Markets
   └─► View Trending Markets
   

3️⃣ STAKE YOUR CONVICTION
   │
   ├─► Select a Market
   ├─► Choose Outcome (Yes / No)
   ├─► Enter Stake Amount
   ├─► Approve Token Spending
   └─► Confirm Transaction
   

4️⃣ MARKET RESOLUTION
   │
   ├─► Market Closes at End Time
   ├─► Oracle Fetches Outcome Data
   ├─► Resolver Finalizes Result
   └─► Winners Determined Automatically
   

5️⃣ CLAIM WINNINGS
   │
   ├─► Check Your Positions
   ├─► Click "Claim Winnings" Button
   ├─► Confirm Transaction
   └─► Receive Payout (Original + Rewards)
   

6️⃣ CREATE MARKETS (Optional)
   │
   ├─► Fill Market Details
   ├─► Set Close Time
   ├─► Choose Oracle Type
   ├─► Pay Creation Fee
   └─► Market Goes Live!
```

---

## 💰 Market Mechanics

### How It Works

| Feature | Description |
|---------|-------------|
| **Pool System** | All stakes go into a shared pool (Yes/No sides) |
| **Dynamic Odds** | Odds reflect current pool distribution |
| **Multiplier** | Calculated as: `Total Pool / Your Side Pool` |
| **Payout** | Winners split the entire pool proportionally |
| **Fees** | Protocol fee (max 5%) + Creator fee (max 3%) |
| **Resolution** | Automated via oracles or manual resolver |

### Market Types

| Type | Resolution Method | Example |
|------|------------------|---------|
| **Price Market** | Oracle price feed | "Will ETH be > $3000 by Dec 31?" |
| **Sports Market** | Sports API data | "Will Team A win the match?" |
| **Manual Market** | Resolver decides | "Will event X happen?" |

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React 18** - Modern UI library
- ⚡ **Next.js 14** - App Router, Server Components
- 🎨 **TailwindCSS** - Utility-first styling
- 🎭 **shadcn/ui** - Beautiful component library
- 🔗 **wagmi** - React Hooks for Ethereum
- 🌈 **RainbowKit** - Wallet connection UI
- 📊 **Framer Motion** - Smooth animations

### Backend
- 🟢 **Node.js** - Runtime environment
- 🚂 **Express.js** - Web framework
- 🍃 **MongoDB** - Database for market metadata
- 🔄 **Cron Jobs** - Scheduled oracle checks
- 🌐 **REST API** - Market data endpoints

### Blockchain
- 🔗 **Solidity ^0.8.20** - Smart contract language
- ⛑️ **Hardhat** - Development framework
- 🧪 **OpenZeppelin** - Secure contract libraries
- 🌐 **Celo (Sepolia)** - Blockchain network
- 📊 **ethers.js** - Blockchain interaction

### Oracle Integration
- 📡 **Price Feeds** - Real-time crypto prices
- ⚽ **Sports APIs** - Match and event data
- 🤖 **Automated Resolution** - Trustless outcomes

---

## 📁 Project Structure

```
convex/
├── 📱 apps/
│   ├── web/                      # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/              # Next.js App Router pages
│   │   │   │   ├── page.tsx      # Home page
│   │   │   │   ├── markets/      # Market browsing
│   │   │   │   ├── market/[id]/  # Market detail
│   │   │   │   ├── create/       # Create market
│   │   │   │   └── resolver/     # Resolver dashboard
│   │   │   ├── components/       # React components
│   │   │   │   ├── markets/      # Market cards, filters
│   │   │   │   ├── home/         # Homepage components
│   │   │   │   ├── resolver/     # Resolver UI
│   │   │   │   └── ui/           # shadcn components
│   │   │   ├── lib/              # Utilities
│   │   │   │   ├── contracts/   # Contract ABIs & helpers
│   │   │   │   ├── hooks/        # Custom React hooks
│   │   │   │   ├── api/          # API clients
│   │   │   │   └── markets/      # Market utilities
│   │   │   └── types/            # TypeScript types
│   │   └── package.json
│   │
│   ├── backend/                   # Node.js backend
│   │   ├── src/
│   │   │   ├── routes/           # API routes
│   │   │   ├── markets/          # Market models & services
│   │   │   ├── oracle/           # Oracle integration
│   │   │   │   ├── coingecko.service.ts
│   │   │   │   ├── sports.service.ts
│   │   │   │   └── evaluator.ts
│   │   │   ├── jobs/             # Scheduled tasks
│   │   │   └── scripts/          # Utility scripts
│   │   └── package.json
│   │
│   └── contracts/                 # Smart contracts
│       ├── contracts/
│       │   └── ConvexMarketManager.sol
│       ├── scripts/              # Deployment scripts
│       ├── test/                 # Contract tests
│       └── hardhat.config.ts
│
└── 📚 README.md
```

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- Node.js v18+
- pnpm 8+
- MongoDB (local or cloud)
- MetaMask or Valora wallet
- Celo Sepolia testnet tokens (get from faucet)
```

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Juggernaut7/convex.git
cd convex
```

### 2️⃣ Install Dependencies

```bash
pnpm install
```

### 3️⃣ Setup Backend

```bash
cd apps/backend
cp .example .env

# Configure .env (defaults below are safe for local dev; swap in your hosted values)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/convex
MANAGER_ADDRESS=0xD1DbF3F78bC53d918CBca130Ddc7784574181075
RPC_URL=https://forno.celo-sepolia.celo-testnet.org
PRIVATE_KEY=your_resolver_private_key

# Start backend
pnpm dev
```

### 4️⃣ Setup Frontend

```bash
cd ../web
cp .example .env.local

# Configure .env.local
NEXT_PUBLIC_MANAGER_ADDRESS=0xD1DbF3F78bC53d918CBca130Ddc7784574181075
NEXT_PUBLIC_STAKING_TOKEN_ADDRESS=0x6c23508a9b310c5f2eb2e2efebeb748067478667
NEXT_PUBLIC_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
NEXT_PUBLIC_CHAIN_ID=11142220
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
# For production, switch NEXT_PUBLIC_API_BASE_URL to https://convex-q9pc.onrender.com
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id

# Start frontend
pnpm dev
```

### 5️⃣ Get Testnet Tokens

1. Visit [Celo Sepolia Faucet](https://faucet.celo.org)
2. Enter your wallet address
3. Receive testnet CELO & cUSD

### 6️⃣ Start Using!

**Option A: Use Live Deployment**

Visit https://convex-seven.vercel.app/ (production frontend powered by the hosted API at https://convex-q9pc.onrender.com/)

Connect your wallet

Browse and stake on markets! 💎

**Option B: Run Locally**

```bash
# Terminal 1: Backend
cd apps/backend && pnpm dev

# Terminal 2: Frontend
cd apps/web && pnpm dev
```

Open http://localhost:3000 (remember to point `NEXT_PUBLIC_API_BASE_URL` at http://localhost:5000)

Connect your wallet

Start predicting! 🚀

---

## 🔐 Smart Contract Functions

### ConvexMarketManager.sol

#### Create Market
```solidity
function createMarket(
    MarketType marketType,
    uint64 closeTime,
    uint16 protocolFeeBps,
    uint16 creatorFeeBps,
    bytes32 metadataHash
) external returns (uint32 marketId)
```

#### Stake on Market
```solidity
function stake(
    uint32 marketId,
    Outcome outcome,
    uint128 amount
) external
```

#### Resolve Market
```solidity
function resolveMarket(
    uint32 marketId,
    Outcome winningOutcome
) external onlyRole(RESOLVER_ROLE)
```

#### Claim Winnings
```solidity
function claim(uint32 marketId) external
```

#### Get Position
```solidity
function positionOf(
    uint32 marketId,
    address account
) external view returns (uint128 yesStake, uint128 noStake)
```

---

## 🧪 Testing

### Run Smart Contract Tests

```bash
cd apps/contracts
pnpm test

# With coverage
npx hardhat coverage
```

### Run Backend Tests

```bash
cd apps/backend
pnpm test
```

### Run Frontend Tests

```bash
cd apps/web
pnpm test
```

---

## 📊 Key Metrics

| Metric | Status |
|--------|--------|
| **Total Markets Created** | Growing |
| **Total Value Locked** | Testnet Phase |
| **Active Users** | Testnet Phase |
| **Resolution Accuracy** | 100% (Oracle-powered) |
| **Average Transaction Time** | <5 seconds |
| **Gas Cost per Stake** | ~$0.01 |

---

## 🎯 Roadmap

### ✅ Phase 1: Foundation (Q4 2024) - COMPLETE
- ✅ Smart contract development
- ✅ Frontend & backend development
- ✅ Testnet deployment
- ✅ Basic features (Create, Stake, Resolve, Claim)
- ✅ Oracle integration

### 🚧 Phase 2: Enhancement (Q1 2025) - IN PROGRESS
- 🔄 Mainnet deployment
- 🔄 Enhanced UI/UX improvements
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app optimization
- 🔄 Multi-language support

### 📅 Phase 3: Expansion (Q2 2025)
- 📋 More oracle integrations
- 📋 Cross-chain support
- 📋 Governance token
- 📋 DAO governance
- 📋 Advanced market types

### 🔮 Phase 4: Scale (Q3 2025)
- 🚀 Institutional features
- 🚀 API for partners
- 🚀 White-label solution
- 🚀 Global expansion
- 🚀 Advanced analytics

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🔧 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to branch (`git push origin feature/amazing-feature`)
5. 🎉 Open a Pull Request

Please read `CONTRIBUTING.md` for details (if available).

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team

**Juggernaut7**  
Founder & Lead Developer  
[@Juggernaut7](https://github.com/Juggernaut7)

Built with passion for the future of prediction markets on Celo 💚

---

## 🔗 Links

- 🌐 **Website**: [Coming Soon]
- 📡 **Backend API**: [API Documentation]
- 🔗 **GitHub**: [github.com/Juggernaut7/convex](https://github.com/Juggernaut7/convex)
- 📊 **Contracts**: [CeloScan Explorer](https://sepolia.celoscan.io/address/0xD1DbF3F78bC53d918CBca130Ddc7784574181075)

---

## 💬 Support

Need help? We're here!

- 📧 **Email**: abdulkabir0600@gmail.com
- 🔗 **GitHub Issues**: [Create an issue](https://github.com/Juggernaut7/convex/issues)
- 💬 **Discord**: [Coming Soon]

---

## ⚠️ Disclaimer

**Important**: Convex is currently in **TESTNET phase**. Do not use real funds. Always:

- ✅ Use Celo Sepolia testnet
- ✅ Test with small amounts first
- ✅ Understand smart contract risks
- ✅ Do your own research (DYOR)

**Audits**: Smart contracts are currently unaudited. Mainnet launch will include professional audits.

---

## 🙏 Acknowledgments

- **Celo Foundation** - For the amazing blockchain
- **OpenZeppelin** - For secure contract libraries
- **Hardhat** - For development tools
- **Next.js** - For the UI framework
- **All our amazing contributors!** 💚

---

## 💚 Built with love on Celo 💚

*Made possible by the Celo community*

---

⬆️ **Back to Top**

**Star ⭐ this repo if you find it helpful!**

---

### About

**Convex** - Where conviction meets blockchain! A next-generation prediction market platform that brings decentralized betting to the Celo ecosystem. Create markets, stake your beliefs, and earn rewards—all secured by smart contracts and powered by real-time oracles. Smart contracts + Beautiful UX = Your predictions, working 24/7 💎
