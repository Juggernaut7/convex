export type MarketCategory = "Sports" | "Crypto" | "Culture" | "Custom";

export type MarketStatus = "Live" | "Closed" | "Resolved" | "Void";

export type OutcomeSide = "yes" | "no";

export interface MarketViewModel {
  id: string;
  backendId: string;
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
}
