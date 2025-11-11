import { API_BASE_URL } from "@/lib/constants";
import { MarketViewModel } from "@/types/market";
import { adaptMarketDocuments } from "@/lib/markets/adapter";

export interface MarketDto {
  _id: string;
  title: string;
  description?: string;
  category: "sports" | "crypto" | "culture" | "custom";
  marketType: "price" | "event";
  onChainMarketId?: number;
  oracleId?: string;
  thresholdValue?: number;
  eventReference?: string;
  closeTime: string;
  resolveBy?: string;
  createdBy: string;
  status: "draft" | "live" | "settled" | "void";
  resolutionSource: "manual" | "oracle";
  winningOutcome?: "yes" | "no";
  oracleMeta?: {
    lastResolutionTx?: string;
    payload?: Record<string, unknown>;
    lastError?: string;
    lastErrorAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export async function fetchMarkets(): Promise<MarketViewModel[]> {
  const response = await fetch(`${API_BASE_URL}/markets`, {
    next: { revalidate: 15 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch markets: ${response.statusText}`);
  }

  const payload = (await response.json()) as ApiResponse<MarketDto[]>;
  return adaptMarketDocuments(payload.data);
}

export async function fetchMarketById(id: string): Promise<MarketViewModel | null> {
  const response = await fetch(`${API_BASE_URL}/markets/${id}`, {
    next: { revalidate: 15 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch market ${id}: ${response.statusText}`);
  }

  const payload = (await response.json()) as ApiResponse<MarketDto>;
  const [market] = await adaptMarketDocuments([payload.data]);
  return market ?? null;
}

