import express from "express";
import mongoose from "mongoose";
import { createMarketMetadata, findMarketByOnChainId } from "../markets/market.service";
import { logger } from "../config/logger";

const router = express.Router();

// Store market metadata after on-chain creation
router.post("/metadata", async (req, res) => {
  try {
    const { onChainId, title, description, category, marketType, resolutionSource } = req.body;

    if (!onChainId || typeof onChainId !== "number") {
      return res.status(400).json({ error: "onChainId is required and must be a number" });
    }
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "title is required and must be a string" });
    }
    if (!category || !["Sports", "Crypto", "Culture"].includes(category)) {
      return res.status(400).json({ error: "category must be Sports, Crypto, or Culture" });
    }
    if (!marketType || !["crypto", "sports", "event"].includes(marketType)) {
      return res.status(400).json({ error: "marketType must be crypto, sports, or event" });
    }
    if (!resolutionSource || !["flare", "coingecko"].includes(resolutionSource)) {
      return res.status(400).json({ error: "resolutionSource must be flare or coingecko" });
    }

    const market = await createMarketMetadata({
      onChainId,
      title,
      description,
      category,
      marketType,
      resolutionSource,
    });

    logger.info({ onChainId, title }, "Market metadata stored");

    res.json({
      success: true,
      market: {
        id: (market._id as mongoose.Types.ObjectId).toString(),
        onChainId: market.onChainId,
        title: market.title,
        description: market.description,
        category: market.category,
      },
    });
  } catch (error) {
    logger.error({ error }, "Error storing market metadata");
    res.status(500).json({ error: "Failed to store market metadata" });
  }
});

// Get market metadata by on-chain ID
router.get("/metadata/:onChainId", async (req, res) => {
  try {
    const onChainId = parseInt(req.params.onChainId, 10);
    if (isNaN(onChainId)) {
      return res.status(400).json({ error: "Invalid onChainId" });
    }

    logger.info({ onChainId }, "Fetching market metadata");
    const market = await findMarketByOnChainId(onChainId);
    if (!market) {
      logger.info({ onChainId }, "Market metadata not found");
      return res.status(404).json({ error: "Market metadata not found" });
    }

    logger.info({ onChainId, title: market.title }, "Market metadata found");
    res.json({
      id: (market._id as mongoose.Types.ObjectId).toString(),
      onChainId: market.onChainId,
      title: market.title,
      description: market.description,
      category: market.category,
      marketType: market.marketType,
      resolutionSource: market.resolutionSource,
      status: market.status,
      outcome: market.outcome,
      createdAt: market.createdAt,
      updatedAt: market.updatedAt,
    });
  } catch (error) {
    logger.error({ error, onChainId: req.params.onChainId }, "Error fetching market metadata");
    res.status(500).json({ error: "Failed to fetch market metadata" });
  }
});

// Get all markets metadata (for debugging)
router.get("/metadata", async (_req, res) => {
  try {
    const { MarketModel } = await import("../markets/market.model");
    const markets = await MarketModel.find({}).sort({ onChainId: 1 }).limit(20);
    res.json({
      count: markets.length,
      markets: markets.map((m) => ({
        onChainId: m.onChainId,
        title: m.title,
        category: m.category,
      })),
    });
  } catch (error) {
    logger.error({ error }, "Error fetching all markets metadata");
    res.status(500).json({ error: "Failed to fetch markets metadata" });
  }
});

// Note: Market resolution is done directly on-chain via the resolver wallet
// This endpoint is not used - resolution happens through smart contract calls
// Keeping for potential future use or API consistency
router.post("/:marketId/resolve", async (req, res) => {
  try {
    const { marketId } = req.params;
    const { outcome } = req.body;

    if (!outcome || !["yes", "no"].includes(outcome)) {
      return res.status(400).json({ error: "Invalid outcome. Must be 'yes' or 'no'" });
    }

    logger.info({ marketId, outcome }, "Resolution request received (note: resolution is done on-chain)");
    
    // This endpoint is informational - actual resolution happens on-chain
    res.json({
      message: "Resolution should be done directly on-chain via smart contract",
      marketId,
      outcome,
      note: "Use the resolver dashboard to resolve markets on-chain",
    });
  } catch (error) {
    logger.error({ error }, "Error in resolve endpoint");
    res.status(500).json({ error: "Failed to process resolution request" });
  }
});

export default router;

