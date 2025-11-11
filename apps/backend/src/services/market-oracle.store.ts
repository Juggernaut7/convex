import { Market } from "../modules/markets/market.model.js";
import type { MarketDocument } from "../modules/markets/market.model.js";

export interface PendingMarket {
  id: string;
  onChainMarketId: number;
  oracleId?: string;
  thresholdValue?: number;
  closeTime: Date;
  marketType: MarketDocument["marketType"];
  resolutionSource: MarketDocument["resolutionSource"];
}

export async function listPendingOracleMarkets(): Promise<PendingMarket[]> {
  const docs = await Market.find({
    resolutionSource: "oracle",
    status: { $in: ["draft", "live"] },
    onChainMarketId: { $ne: null }
  })
    .sort({ closeTime: 1 })
    .lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    onChainMarketId: doc.onChainMarketId!,
    oracleId: doc.oracleId,
    thresholdValue: doc.thresholdValue,
    closeTime: doc.closeTime,
    marketType: doc.marketType,
    resolutionSource: doc.resolutionSource
  }));
}

export async function markMarketResolving(id: string) {
  await Market.findByIdAndUpdate(id, { status: "settled" });
}

export async function markMarketResolved(id: string, outcome: "yes" | "no", txHash: string, payload?: Record<string, unknown>) {
  await Market.findByIdAndUpdate(id, {
    status: "settled",
    winningOutcome: outcome,
    $set: {
      "oracleMeta.lastResolutionTx": txHash,
      "oracleMeta.payload": payload,
      updatedAt: new Date()
    }
  });
}

export async function markMarketErrored(id: string, message: string) {
  await Market.findByIdAndUpdate(id, {
    $set: {
      "oracleMeta.lastError": message,
      "oracleMeta.lastErrorAt": new Date()
    }
  });
}

