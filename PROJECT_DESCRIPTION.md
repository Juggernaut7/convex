# Convex - Complete Project Description

## Project Overview

**Convex** is a fully-functional, production-ready decentralized prediction market platform built on the Celo blockchain. It enables users to create, participate in, and resolve prediction markets for crypto prices, sports events, and cultural outcomes. The platform features a sophisticated smart contract system, automated oracle resolution, beautiful user interface, and comprehensive market management tools.

## Core Platform Features

### 1. Market Creation & Management
- **Multi-Type Markets**: Support for three market categories:
  - **Crypto Price Markets**: Predict cryptocurrency price movements (ETH, BTC, CELO, etc.)
  - **Sports Markets**: Bet on sports match outcomes and tournament results
  - **Culture & Events**: Create markets for any imaginable outcome
- **Market Configuration**: Creators can set close times, resolution methods, protocol fees (max 5%), and creator fees (max 3%)
- **Metadata System**: Each market stores title, description, category, and resolution conditions off-chain in MongoDB
- **Market Lifecycle Management**: Complete state machine from Live → Closed → Resolved/Void

### 2. Conviction-Based Staking System
- **Pool-Based Architecture**: All stakes go into shared Yes/No pools
- **Dynamic Odds Calculation**: Real-time odds reflect current pool distribution
  - Formula: `Yes Odds = (Yes Pool / Total Pool) × 100`
  - Automatically updates as users stake
- **Multiplier System**: Potential payout multipliers calculated as `Total Pool / Your Side Pool`
- **Proportional Payouts**: Winners split the entire pool proportionally based on their stake size
- **Fee Distribution**: Protocol fees go to treasury, creator fees go to market creator

### 3. Smart Contract Architecture

#### ConvexMarketManager.sol (Main Contract)
- **Role-Based Access Control**: Three distinct roles using OpenZeppelin's AccessControl
  - `CREATOR_ROLE`: Can create markets
  - `RESOLVER_ROLE`: Can resolve markets
  - `GUARDIAN_ROLE`: Can pause contract in emergencies
- **Security Features**:
  - ReentrancyGuard protection on all state-changing functions
  - Pausable contract for emergency stops
  - SafeERC20 for secure token transfers
  - Input validation on all parameters
- **Core Functions**:
  - `createMarket()`: Creates new markets with configurable parameters
  - `stake()`: Allows users to stake on Yes or No outcomes
  - `resolveMarket()`: Resolves markets and calculates payouts
  - `claim()`: Allows winners to claim their proportional share
  - `positionOf()`: View function to check user positions
  - `getMarket()`: View function to fetch market state
- **Market States**: Live → Resolving → Resolved/Void
- **Automatic Void Handling**: Markets with zero pools or no winning stakes are automatically voided
- **Fee Calculation**: Protocol and creator fees deducted before payout distribution

### 4. Automated Oracle Resolution System

#### Backend Oracle Service
- **Scheduled Resolution**: Cron job runs every 60 seconds to check pending markets
- **Multi-Source Price Feeds**:
  - **CoinGecko Integration**: Real-time cryptocurrency price data
  - **Sports API Integration**: Match results and event outcomes
- **Condition Evaluation Engine**: Supports five comparison operators:
  - Greater than (>)
  - Less than (<)
  - Greater than or equal (>=)
  - Less than or equal (<=)
  - Equal to (==)
- **Automatic Resolution Flow**:
  1. Backend checks all markets past their close time
  2. Fetches current price/data from oracle source
  3. Evaluates condition against fetched value
  4. Determines Yes/No outcome
  5. Calls smart contract `resolveMarket()` function
  6. Updates MongoDB with resolution status
- **Error Handling**: Comprehensive logging and error recovery for failed resolutions

#### Frontend Oracle Visualization
- **Live Price Display**: Real-time price feeds shown in resolver dashboard
- **Condition Evaluation Preview**: Shows whether condition is met before resolution
- **Oracle Status Indicators**: Visual feedback for oracle connection and data freshness

### 5. User Interface & Experience

#### Homepage Features
- **Hero Section**: Compelling landing page with clear value proposition
- **Trending Markets Section**: Algorithm-driven display of most active markets
- **Featured Markets**: Top markets by total pool size
- **Market Categories**: Easy filtering by Sports, Crypto, Culture
- **Search Functionality**: Full-text search across market titles and descriptions

#### Market Browsing
- **Market Gallery**: Grid layout with responsive cards
- **Market Cards**: Display key information:
  - Market title and description
  - Current odds (Yes/No percentages)
  - Total pool size
  - Time until close
  - Status badges (Live, Ended, Resolved)
  - Visual odds bar showing pool distribution
- **Smart Sorting**: Markets automatically sorted by status:
  - Live markets appear first
  - Closed markets move to bottom
  - Resolved/Void markets at the end
- **Status Indicators**: Clear visual distinction between market states

#### Market Detail View
- **Comprehensive Market Information**: Full market details, pool breakdown, odds visualization
- **Staking Interface**: 
  - One-click staking on Yes/No
  - Real-time balance display
  - Token approval flow
  - Transaction status feedback
- **Position Tracking**: Shows user's current stakes on both sides
- **Claim Button**: Appears only for resolved markets where user has winning position
  - Automatically hides after successful claim
  - Refetches position after claim to update UI
  - Prevents duplicate claims
- **Resolver Controls**: Special interface for market resolvers
  - Shows oracle evaluation results
  - Manual resolution option for non-oracle markets
  - Prevents double resolution (buttons disabled after first resolution)

#### Dashboard Features
- **User Positions**: Table showing all markets user has staked on
- **Position Details**: 
  - Stake amounts (Yes/No sides)
  - Market status (Awaiting result / Settled)
  - Potential payouts
  - Claim status
- **Wallet Connection**: Seamless wallet integration with RainbowKit
- **Balance Display**: Real-time token balance updates

#### Resolver Dashboard
- **Pending Markets**: List of markets ready for resolution
- **Oracle Data Display**: 
  - Current price/value
  - Target condition
  - Evaluation result (met/missed)
  - Time until close
- **Resolution Controls**:
  - Automatic outcome suggestion based on oracle data
  - Manual override for edge cases
  - One-click resolution
  - Status updates after resolution
- **Prevention of Double Resolution**: 
  - Buttons disabled after market is resolved
  - Clear "Market Resolved" status display
  - Shows winning outcome

### 6. Trending Markets Algorithm

A sophisticated algorithm determines which markets appear in the "Trending" section:

**Filtering Criteria**:
- Only Live markets (explicitly excludes Closed, Resolved, Void)
- Markets must have actual stakes (totalPool > 0)

**Scoring Factors**:
1. **Pool Size Score**: Base score from total pool value
2. **Urgency Multiplier**: 
   - Markets closing in next 24h: 1.5x boost
   - Markets closing in 24-48h: 1.2x boost
   - Markets closing in 48h-7days: Gradual boost (1.0-1.3x)
   - Markets closing beyond 7 days: No boost
3. **Activity Multiplier**: 
   - Markets with balanced odds (closer to 50/50) get up to 20% boost
   - Indicates active trading and engagement

**Final Trending Score**: `Pool Score × Urgency Multiplier × Activity Multiplier`

Markets are sorted by trending score (highest first) and top 4 are displayed.

### 7. Market Status Management

#### Status Lifecycle
- **Live**: Market is open for staking
- **Closed**: Market has passed close time but not yet resolved
- **Resolved**: Market has been resolved with a winning outcome
- **Void**: Market had no stakes or no winning side

#### UI Status Handling
- **Ended Badge**: Automatically appears on market cards when status is Closed/Resolved/Void
- **Status-Based Sorting**: Markets automatically reorder based on status
- **Time Display**: Shows "Closes in Xh" for live markets, "Ended" for closed markets
- **Claim Button Logic**: 
  - Only appears for Resolved/Void markets
  - Only shows if user has claimable position
  - Automatically hides after successful claim
  - Refetches position to ensure accuracy

### 8. Security & Access Control

#### Smart Contract Security
- **OpenZeppelin Libraries**: Battle-tested security patterns
- **Reentrancy Protection**: All external calls protected
- **Access Control**: Role-based permissions prevent unauthorized actions
- **Input Validation**: All parameters validated before execution
- **Safe Math**: Built-in overflow protection in Solidity 0.8.20+
- **Pausable**: Emergency stop mechanism for critical issues

#### Frontend Security
- **Transaction Validation**: All transactions validated before submission
- **Error Handling**: Comprehensive error messages for failed transactions
- **State Management**: Proper state updates prevent UI inconsistencies
- **Wallet Integration**: Secure wallet connection via RainbowKit

### 9. Technical Stack

#### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom design system
- **Components**: shadcn/ui component library
- **Blockchain Integration**: 
  - wagmi v2 for Ethereum/Celo interactions
  - RainbowKit for wallet connection
  - viem for contract interactions
- **Animations**: Framer Motion for smooth transitions
- **State Management**: React hooks (useState, useEffect, useMemo)
- **Data Fetching**: Custom hooks for market data, positions, prices

#### Backend (Node.js/Express)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB for market metadata
- **Oracle Services**:
  - CoinGecko API for crypto prices
  - Sports API for match results
- **Scheduling**: setInterval for oracle polling (60-second intervals)
- **Error Handling**: Comprehensive logging with structured logs

#### Smart Contracts (Solidity)
- **Language**: Solidity ^0.8.20
- **Framework**: Hardhat
- **Libraries**: OpenZeppelin Contracts
- **Network**: Celo Sepolia Testnet
- **Deployment**: Automated deployment scripts

### 10. Market Creation Flow

1. **User Input**: Creator fills market creation form
   - Title and description
   - Category selection (Sports/Crypto/Culture)
   - Close time
   - Resolution source (oracle/manual)
   - Condition (for oracle markets): target value and operator
   - Asset identifier (for price/sports markets)

2. **Metadata Storage**: Market metadata saved to MongoDB
   - Title, description, category
   - Resolution conditions
   - Asset identifiers

3. **Smart Contract Creation**: 
   - User calls `createMarket()` on contract
   - Contract generates unique market ID
   - Market state initialized as "Live"
   - Creator address and resolver address stored

4. **Market Goes Live**: 
   - Appears in market listings
   - Users can start staking
   - Oracle begins monitoring (if applicable)

### 11. Staking Flow

1. **User Selection**: User chooses market and outcome (Yes/No)
2. **Amount Input**: User enters stake amount
3. **Token Approval**: First-time users approve token spending
4. **Stake Transaction**: User calls `stake()` function
5. **Pool Update**: Yes/No pool increases, odds recalculate
6. **UI Update**: Market card and detail view update with new odds
7. **Position Tracking**: User's position tracked on-chain

### 12. Resolution Flow

#### Automated (Oracle) Markets
1. **Close Time Reached**: Market status changes to "Closed"
2. **Oracle Polling**: Backend scheduler checks market
3. **Data Fetching**: Oracle service fetches current price/data
4. **Condition Evaluation**: Backend evaluates condition against fetched value
5. **Outcome Determination**: Yes/No outcome calculated
6. **On-Chain Resolution**: Backend calls `resolveMarket()` with outcome
7. **Payout Calculation**: Contract calculates fees and payout pool
8. **Status Update**: Market status changes to "Resolved"
9. **Database Update**: MongoDB updated with resolution

#### Manual Markets
1. **Close Time Reached**: Market status changes to "Closed"
2. **Resolver Access**: Resolver accesses resolver dashboard
3. **Manual Selection**: Resolver chooses Yes/No outcome
4. **On-Chain Resolution**: Resolver calls `resolveMarket()` directly
5. **Payout Calculation**: Same as automated flow
6. **Status Update**: Market status changes to "Resolved"

### 13. Claim Flow

1. **Market Resolution**: Market must be Resolved or Void
2. **Position Check**: Frontend checks user's on-chain position
3. **Claimable Check**: Determines if user has winning stake
4. **Claim Button**: Button appears if claimable
5. **Claim Transaction**: User calls `claim()` function
6. **Payout Calculation**: Contract calculates proportional share
7. **Token Transfer**: Payout sent to user's wallet
8. **Position Update**: User's position set to zero
9. **UI Update**: Claim button disappears, position shows zero

### 14. UI/UX Improvements Implemented

#### Market Status Display
- **Ended Badge**: Red badge appears on closed/resolved/void markets
- **Status-Based Sorting**: Live markets always appear first
- **Time Display**: Clear indication of market status and time remaining

#### Claim Button Logic
- **Smart Visibility**: Only shows when user has claimable funds
- **Auto-Hide**: Disappears after successful claim
- **Position Refetch**: Automatically updates after claim transaction
- **Prevents Duplicate Claims**: Button won't appear if already claimed

#### Resolver Controls
- **Double Resolution Prevention**: Buttons disabled after first resolution
- **Status Display**: Clear "Market Resolved" message after resolution
- **Outcome Display**: Shows winning outcome prominently

#### Trending Markets
- **Live Markets Only**: Closed markets excluded from trending
- **Sophisticated Algorithm**: Multi-factor scoring system
- **Real-Time Updates**: Trending list updates as markets change

### 15. Database Schema

#### Market Document (MongoDB)
- `onChainId`: Unique identifier matching smart contract market ID
- `title`: Market title
- `description`: Market description
- `category`: Sports, Crypto, or Culture
- `marketType`: crypto, sports, or event
- `resolutionSource`: flare or coingecko
- `condition`: Object with `target` (number) and `operator` (string)
- `asset`: Asset identifier (e.g., "ethereum" for ETH price)
- `status`: pending or resolved
- `outcome`: yes or no (null if pending)
- `createdAt`, `updatedAt`: Timestamps

### 16. API Endpoints

#### Market Endpoints
- `GET /api/markets`: Fetch all markets with metadata
- `GET /api/markets/:id`: Fetch single market with metadata
- `POST /api/markets`: Create new market metadata (admin)

#### Oracle Endpoints
- Internal oracle service endpoints for price/data fetching

### 17. Wallet Integration

- **Multi-Wallet Support**: MetaMask, Valora, MiniPay, WalletConnect
- **Auto-Reconnect**: Wallet connection persists across sessions
- **Network Detection**: Automatically detects Celo Sepolia network
- **Transaction Handling**: Full transaction lifecycle management
- **Error Handling**: User-friendly error messages for failed transactions

### 18. Responsive Design

- **Mobile-First**: Optimized for mobile wallets (MiniPay, Valora)
- **Tablet Support**: Responsive layouts for medium screens
- **Desktop Experience**: Full-featured desktop interface
- **Touch-Friendly**: Large buttons and touch targets
- **Fast Loading**: Optimized images and code splitting

### 19. Error Handling & User Feedback

- **Transaction Errors**: Clear error messages for failed transactions
- **Loading States**: Visual feedback during transaction processing
- **Success Confirmations**: Clear success messages for completed actions
- **Network Errors**: Graceful handling of network issues
- **Oracle Errors**: Logging and recovery for oracle failures

### 20. Future-Ready Architecture

- **Leaderboard Placeholder**: "Coming Soon" page for future leaderboard feature
- **Extensible Market Types**: Easy to add new market categories
- **Modular Oracle System**: Easy to add new oracle sources
- **Scalable Database**: MongoDB schema supports future features
- **Upgradeable Contracts**: Architecture allows for future improvements

## Deployment Information

### Smart Contracts (Celo Sepolia)
- **ConvexMarketManager**: `0xD1DbF3F78bC53d918CBca130Ddc7784574181075`
- **MockERC20 (Staking Token)**: `0x6c23508a9b310c5f2eb2e2efebeb748067478667`

### Frontend
- **Framework**: Next.js 14
- **Deployment**: Vercel (production-ready)
- **Environment**: Configured for Celo Sepolia testnet

### Backend
- **Framework**: Node.js/Express
- **Database**: MongoDB Atlas (cloud-hosted)
- **Oracle Service**: Running on scheduled intervals

## Key Achievements

1. **Complete Market Lifecycle**: From creation to resolution to payout
2. **Automated Resolution**: Oracle-powered automatic market resolution
3. **Professional UI/UX**: Beautiful, intuitive interface with smooth animations
4. **Security First**: OpenZeppelin contracts, reentrancy protection, access control
5. **Mobile Optimized**: Perfect for MiniPay and mobile wallet users
6. **Real-Time Updates**: Live odds, pool sizes, and market status
7. **Smart Sorting**: Markets automatically organized by status and relevance
8. **Trending Algorithm**: Sophisticated multi-factor scoring system
9. **Error Prevention**: UI prevents invalid actions (double resolution, duplicate claims)
10. **Production Ready**: Fully tested, deployed, and functional

## Technical Highlights

- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Gas Optimization**: Efficient smart contract design minimizes gas costs
- **Scalability**: Architecture supports thousands of concurrent markets
- **Modularity**: Clean separation of concerns (contracts, frontend, backend, oracle)
- **Maintainability**: Well-documented code with clear structure
- **Testing**: Comprehensive test coverage for smart contracts

## User Experience Highlights

- **One-Click Staking**: Simple, intuitive staking process
- **Real-Time Feedback**: Immediate updates after transactions
- **Clear Status Indicators**: Always know market status at a glance
- **Smart Defaults**: System suggests best actions (e.g., oracle outcomes)
- **Error Recovery**: Clear guidance when things go wrong
- **Mobile Friendly**: Works seamlessly on mobile wallets

This is a complete, production-ready prediction market platform with all core features implemented, tested, and deployed. The system is secure, scalable, and provides an excellent user experience for both market participants and resolvers.

