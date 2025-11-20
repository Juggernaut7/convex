import { MarketModel, MarketDocument, MarketStatus } from "./market.model";

export async function findPendingMarkets(): Promise<MarketDocument[]> {
  return MarketModel.find({ status: "pending" }).exec();
}

export async function findMarketByOnChainId(onChainId: number): Promise<MarketDocument | null> {
  return MarketModel.findOne({ onChainId }).exec();
}

export async function createMarketMetadata(data: {
  onChainId: number;
  title: string;
  description?: string;
  category: "Sports" | "Crypto" | "Culture";
  marketType: "crypto" | "sports" | "event";
  resolutionSource: "flare" | "coingecko";
}): Promise<MarketDocument> {
  const existing = await findMarketByOnChainId(data.onChainId);
  if (existing) {
    // Update existing
    existing.title = data.title;
    if (data.description) existing.description = data.description;
    existing.category = data.category;
    existing.marketType = data.marketType;
    existing.resolutionSource = data.resolutionSource;
    return existing.save();
  }
  
  const market = new MarketModel({
    ...data,
    status: "pending" as MarketStatus,
  });
  return market.save();
}

export async function markMarketResolved(
  id: string,
  outcome: "yes" | "no"
): Promise<void> {
  await MarketModel.findByIdAndUpdate(
    id,
    { status: "resolved" as MarketStatus, outcome },
    { new: true }
  ).exec();
}

export async function markMarketResolvedByOnChainId(
  onChainId: number,
  outcome: "yes" | "no"
): Promise<void> {
  await MarketModel.findOneAndUpdate(
    { onChainId },
    { status: "resolved" as MarketStatus, outcome },
    { new: true }
  ).exec();
}


