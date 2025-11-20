import { parseAbi, type Address } from "viem";
import { MANAGER_CONTRACT_ADDRESS } from "@/lib/constants";

export const CONVEX_MANAGER_ADDRESS = MANAGER_CONTRACT_ADDRESS as Address;

export const convexManagerAbi = parseAbi([
  "function createMarket((uint8 marketType,uint64 closeTime,address resolver,uint16 protocolFeeBps,uint16 creatorFeeBps,bytes32 metadataHash,bytes extraData) params) external returns (uint32)",
  "function stake(uint32 marketId, uint8 outcome, uint128 amount) external",
  "function claim(uint32 marketId) external",
  "function resolveMarket(uint32 marketId, uint8 outcome) external",
  "function markets(uint32 marketId) external view returns (uint8 marketType,uint8 status,uint8 winningOutcome,address creator,address resolver,uint64 closeTime,uint64 resolveTime,uint16 protocolFeeBps,uint16 creatorFeeBps,uint128 yesPool,uint128 noPool,uint128 payoutPool,uint128 totalWinningStake,bytes32 metadataHash)",
  "function positionOf(uint32 marketId, address account) external view returns (uint128 yesStake, uint128 noStake)",
  "function nextMarketId() external view returns (uint32)",
  "function getPriceConfig(uint32 marketId) external view returns (address feed,int192 targetValue,uint8 comparator)",
  "function getSportsConfig(uint32 marketId) external view returns (bytes32 fixtureId,bytes32 leagueId,string endpoint)",
  "event MarketCreated(uint32 indexed marketId,uint8 indexed marketType,address indexed resolver,uint64 closeTime,bytes32 metadataHash)",
  "event MarketResolved(uint32 indexed marketId,uint8 outcome,uint128 payoutPool,uint128 totalWinningStake,bytes resolverContext)",
  "event StakePlaced(uint32 indexed marketId,address indexed account,uint8 outcome,uint256 amount)",
  "event StakeClaimed(uint32 indexed marketId,address indexed account,uint256 payout,bool wasVoid)",
]);

export enum MarketType {
  Price = 0,
  Sports = 1,
}

export enum Outcome {
  Undefined = 0,
  Yes = 1,
  No = 2,
}

export enum MarketStatus {
  Live = 0,
  Resolving = 1,
  Resolved = 2,
  Void = 3,
}

export enum Comparator {
  GreaterThan = 0,
  GreaterThanOrEqual = 1,
  LessThan = 2,
  LessThanOrEqual = 3,
}
