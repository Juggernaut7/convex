import express from "express";
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
        id: market._id.toString(),
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

    const market = await findMarketByOnChainId(onChainId);
    if (!market) {
      return res.status(404).json({ error: "Market metadata not found" });
    }

    res.json({
      id: market._id.toString(),
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
    logger.error({ error }, "Error fetching market metadata");
    res.status(500).json({ error: "Failed to fetch market metadata" });
  }
});

export default router;

