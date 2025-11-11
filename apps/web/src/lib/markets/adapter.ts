import { formatUnits } from "viem";

import { fetchOnChainMarket, getPublicClient } from "@/lib/contracts/manager";
import type { MarketDto } from "@/lib/api/markets";
import { MarketViewModel, OutcomeSide, MarketStatus } from "@/types/market";

function toCategory(category: MarketDto["category"]): MarketViewModel["category"] {
  switch (category) {
    case "sports":
      return "Sports";
    case "crypto":
      return "Crypto";
    case "culture":
      return "Culture";
    default:
      return "Custom";
  }
}

function formatCloseTime(closeTime: number): string {
  const diffMs = closeTime - Date.now();
  if (diffMs <= 0) return "closed";
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function mapStatus(status: number): MarketStatus {
  switch (status) {
    case 0:
      return "Live";
    case 1:
      return "Closed";
    case 2:
      return "Resolved";
    case 3:
      return "Void";
    default:
      return "Live";
  }
}

function mapBackendStatus(status: MarketDto["status"]): MarketStatus {
  switch (status) {
    case "live":
      return "Live";
    case "settled":
      return "Resolved";
    case "void":
      return "Void";
    default:
      return "Closed";
  }
}

function mapOutcome(outcome: number): OutcomeSide | undefined {
  if (outcome === 1) return "yes";
  if (outcome === 2) return "no";
  return undefined;
}

export async function adaptMarketDocuments(docs: MarketDto[]): Promise<MarketViewModel[]> {
  if (docs.length === 0) {
    return [];
  }

  const client = getPublicClient();

  const markets = await Promise.all(
    docs.map(async (doc) => {
      let yesPool = 0;
      let noPool = 0;
      let totalPool = 0;
      let protocolFeeBps = 0;
      let creatorFeeBps = 0;
      let status: MarketStatus = mapBackendStatus(doc.status);
      let winningOutcome: OutcomeSide | undefined = doc.winningOutcome;
      let closeTime = new Date(doc.closeTime).getTime();
      let resolveTime: number | null = doc.resolveBy ? new Date(doc.resolveBy).getTime() : null;
      let usesOracle = doc.resolutionSource === "oracle";
      let resolver: string | undefined;
      let creator: string | undefined;
      let metadataURI: string | undefined;

      if (typeof doc.onChainMarketId === "number") {
        const chainMarket = await fetchOnChainMarket(client, doc.onChainMarketId);
        if (chainMarket) {
          yesPool = Number(formatUnits(chainMarket.yesPool, 18));
          noPool = Number(formatUnits(chainMarket.noPool, 18));
          totalPool = yesPool + noPool;
          protocolFeeBps = chainMarket.protocolFeeBps;
          creatorFeeBps = chainMarket.creatorFeeBps;
          status = mapStatus(chainMarket.status);
          winningOutcome = mapOutcome(chainMarket.winningOutcome) ?? winningOutcome;
          closeTime = Number(chainMarket.closeTime) * 1000 || closeTime;
          resolveTime = Number(chainMarket.resolveTime) ? Number(chainMarket.resolveTime) * 1000 : resolveTime;
          usesOracle = chainMarket.usesOracle;
          resolver = chainMarket.resolver;
          creator = chainMarket.creator;
          metadataURI = chainMarket.metadataURI;
        }
      }

      if (totalPool === 0) {
        totalPool = yesPool + noPool;
      }

      const yesOdds = totalPool === 0 ? 50 : Math.round((yesPool / totalPool) * 100);
      const noOdds = 100 - yesOdds;
      const yesMultiplier = yesPool > 0 ? totalPool / yesPool : 2;
      const noMultiplier = noPool > 0 ? totalPool / noPool : 2;

      return {
        id: doc._id,
        backendId: doc._id,
        onChainMarketId: doc.onChainMarketId,
        title: doc.title,
        description: doc.description,
        category: toCategory(doc.category),
        closeTime: new Date(closeTime).toISOString(),
        resolveTime: resolveTime ? new Date(resolveTime).toISOString() : undefined,
        closesIn: formatCloseTime(closeTime),
        totalPool,
        yesPool,
        noPool,
        yesOdds,
        noOdds,
        yesMultiplier,
        noMultiplier,
        protocolFeeBps,
        creatorFeeBps,
        status,
        winningOutcome,
        usesOracle,
        resolutionSource: doc.resolutionSource,
        resolver,
        creator,
        metadataURI,
        thresholdValue: doc.thresholdValue ?? null,
        oracleId: doc.oracleId,
        eventReference: doc.eventReference,
        updatedAt: doc.updatedAt,
        createdAt: doc.createdAt,
        canStake: Boolean(doc.onChainMarketId) && status === "Live" && closeTime > Date.now(),
      } as MarketViewModel;
    })
  );

  return markets;
}

