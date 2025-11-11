import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { asyncHandler } from "../../middleware/async-handler.js";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import { createMarketSchema, updateMarketSchema } from "./market.validator.js";
import { listMarkets, getMarketById, createMarket, updateMarket, deleteMarket } from "./market.service.js";
import type { MarketCategory, MarketDocument } from "./market.model.js";
import { markMarketResolved, markMarketErrored } from "../../services/market-oracle.store.js";
import { resolveMarketManually } from "../../services/market-oracle.runner.js";

export const list = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const category = req.query.category as string | undefined;
  const status = req.query.status as string | undefined;
  const filters: Partial<Pick<MarketDocument, "category" | "status">> = {};

  const validCategories: MarketCategory[] = ["sports", "crypto", "culture", "custom"];
  const validStatuses: Array<MarketDocument["status"]> = ["draft", "live", "settled", "void"];

  if (category && (validCategories as string[]).includes(category)) {
    filters.category = category as MarketCategory;
  }
  if (status && (validStatuses as string[]).includes(status)) {
    filters.status = status as MarketDocument["status"];
  }

  const markets = await listMarkets(filters);
  return res.status(StatusCodes.OK).json({ success: true, data: markets });
});

export const get = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const market = await getMarketById(req.params.id);
  return res.status(StatusCodes.OK).json({ success: true, data: market });
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Authentication required" });
  }
  const payload = createMarketSchema.parse(req.body);
  const market = await createMarket(payload, req.user._id.toString());
  return res.status(StatusCodes.CREATED).json({ success: true, data: market });
});

export const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payload = updateMarketSchema.parse(req.body);
  const market = await updateMarket(req.params.id, payload);
  return res.status(StatusCodes.OK).json({ success: true, data: market });
});

export const remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await deleteMarket(req.params.id);
  return res.status(StatusCodes.OK).json({ success: true });
});

const resolveMarketSchema = z.object({
  outcome: z.enum(["yes", "no"])
});

export const resolveMarket = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Authentication required" });
  }

  const payload = resolveMarketSchema.parse(req.body);
  const market = await getMarketById(req.params.id);

  if (market.onChainMarketId === undefined || market.onChainMarketId === null) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: "Market is not associated with an on-chain id" });
  }

  try {
    const receipt = await resolveMarketManually(market.onChainMarketId, payload.outcome);
    await markMarketResolved(market._id.toString(), payload.outcome, receipt.transactionHash, {
      manual: true,
      resolvedBy: req.user._id,
      resolvedAt: new Date()
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        txHash: receipt.transactionHash
      }
    });
  } catch (error) {
    await markMarketErrored(market._id.toString(), (error as Error).message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to resolve market",
      error: (error as Error).message
    });
  }
});

