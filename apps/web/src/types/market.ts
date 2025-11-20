export type MarketCategory = "Sports" | "Crypto" | "Culture" | "Custom";

export type MarketStatus = "Live" | "Closed" | "Resolved" | "Void";

export type OutcomeSide = "yes" | "no";

export type OracleOperator = "gte" | "gt" | "lte" | "lt" | "eq";

export interface OracleConfig {
  provider: string;
  assetId: string;
  operator: OracleOperator;
  targetValue: number;
  targetDescription?: string;
  expiry?: string;
}

export interface MarketResolverState {
  source: "manual" | "oracle";
  closeTimeReached: boolean;
  readyToResolve: boolean;
  canResolve: boolean;
  oracleConfig?: OracleConfig;
  lastResolutionTx?: string;
  lastError?: string;
  lastErrorAt?: string;
}

export interface MarketViewModel {
  id: string;
  onChainMarketId?: number;
  title: string;
  description?: string;
  category: MarketCategory;
  closeTime: string;
  resolveTime?: string;
  closesIn: string;
  totalPool: number;
  yesPool: number;
  noPool: number;
  yesOdds: number;
  noOdds: number;
  yesMultiplier: number;
  noMultiplier: number;
  protocolFeeBps?: number;
  creatorFeeBps?: number;
  status: MarketStatus;
  winningOutcome?: OutcomeSide;
  usesOracle: boolean;
  resolutionSource: "manual" | "oracle";
  creator?: string;
  resolver?: string;
  metadataURI?: string;
  thresholdValue: number | null;
  oracleId?: string;
  eventReference?: string;
  updatedAt: string;
  createdAt: string;
  canStake: boolean;
  resolverState: MarketResolverState;
}
